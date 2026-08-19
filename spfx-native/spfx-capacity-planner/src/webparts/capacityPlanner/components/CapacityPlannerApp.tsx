import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';

import { ICapacityPlannerAppProps } from './ICapacityPlannerAppProps';
import {
  IAllocation,
  ICapacityAssumptions,
  IDataLoadResult,
  ILeaveEntry,
  IPerson,
  IPlanningSnapshot,
  IProject,
  IScenario,
  LeaveType,
  ProjectStatus,
  ProjectType,
  ResourceRole,
  defaultScenario
} from '../models/ResourcePlanningModels';
import { emptySnapshot } from '../services/IResourcePlanningRepository';
import {
  allocationHours,
  buildMonthSummaries,
  buildOverloads,
  buildPersonMonthSummaries,
  buildProjectDemandSummaries,
  buildReallocationRecommendations,
  buildRoleMonthSummaries,
  exportPersonCsv,
  getActiveAssumptions,
  getPersonById,
  getProjectById,
  monthlyCapacityHours,
  monthlyCapacityWithLeave,
  utilisationBand
} from '../utils/capacityCalculations';
import { buildMonthRange, firstDayOfMonthIso, monthLabel } from '../utils/dateUtils';
import styles from './CapacityPlannerApp.module.scss';

const projectTypes: ProjectType[] = ['Live', 'Opportunity'];
const projectStatuses: ProjectStatus[] = ['Pipeline', 'Planned', 'Active', 'On Hold', 'Complete', 'Cancelled'];
const leaveTypes: LeaveType[] = ['Holiday', 'Sick', 'Training', 'Public Holiday', 'Unpaid', 'Other'];
const roles: ResourceRole[] = ['Project Management', 'Process Engineering', 'Mechanical Engineering', 'Drafting', 'Procurement', 'Quality', 'Technical Review', 'Management', 'Other'];
const priorities: string[] = ['Low', 'Normal', 'High', 'Critical'];
const brands: string[] = ['DCT', 'PLK', 'Internal', 'Other'];

type PlannerTab = 'dashboard' | 'team' | 'leave' | 'projects' | 'allocate' | 'planning' | 'optimisation' | 'reports' | 'data';
type MatrixMode = 'person' | 'project' | 'role';
type ReportMode = 'person' | 'role' | 'brand' | 'projects' | 'overloads';

function newPerson(): IPerson {
  return { id: `new-person-${new Date().getTime()}`, title: '', email: '', discipline: 'Process Engineering', role: 'Process Engineering', primaryRole: 'Process Engineering', secondaryRoles: [], employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true };
}

function newProject(): IProject {
  return { id: `new-project-${new Date().getTime()}`, title: '', projectCode: '', projectType: 'Live', status: 'Active', brand: 'DCT', priority: 'Normal', client: '', startDate: firstDayOfMonthIso(new Date()), endDate: firstDayOfMonthIso(new Date()), includeInCapacity: true, probability: 100, notes: '' };
}

function newLeave(people: IPerson[]): ILeaveEntry {
  const personId = people.length > 0 ? people[0].id : '';
  return { id: `new-leave-${new Date().getTime()}`, title: 'Leave entry', personId, leaveDate: firstDayOfMonthIso(new Date()), leaveHours: 8, leaveDays: 1, leaveType: 'Holiday', notes: '' };
}

function cloneSnapshot(snapshot: IPlanningSnapshot): IPlanningSnapshot {
  return {
    people: snapshot.people.slice(0),
    projects: snapshot.projects.slice(0),
    allocations: snapshot.allocations.slice(0),
    leave: snapshot.leave.slice(0),
    scenarios: snapshot.scenarios ? snapshot.scenarios.slice(0) : [],
    activeScenarioId: snapshot.activeScenarioId
  };
}

function upsertById<T extends { id: number | string }>(items: T[], item: T): T[] {
  let replaced = false;
  const result = items.map((existing) => {
    if (String(existing.id) === String(item.id)) { replaced = true; return item; }
    return existing;
  });
  if (!replaced) { result.push(item); }
  return result;
}

function removeById<T extends { id: number | string }>(items: T[], id: number | string): T[] {
  return items.filter((item) => String(item.id) !== String(id));
}

function formatNumber(value: number): string { return String(Math.round(value)); }

function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function allocationKey(personId: number | string, month: string): string { return `${personId}|${month}`; }

function findProjectAllocation(snapshot: IPlanningSnapshot, projectId: number | string, personId: number | string, month: string): IAllocation | undefined {
  for (let index = 0; index < snapshot.allocations.length; index++) {
    const allocation = snapshot.allocations[index];
    if (String(allocation.projectId) === String(projectId) && String(allocation.personId) === String(personId) && firstDayOfMonthIso(allocation.allocationMonth) === month) {
      return allocation;
    }
  }
  return undefined;
}

function getProjectMonths(project: IProject | undefined, monthsToShow: number): string[] {
  const months = buildMonthRange(monthsToShow);
  if (!project) { return months; }
  const start = project.startDate ? firstDayOfMonthIso(project.startDate) : '';
  const end = project.endDate ? firstDayOfMonthIso(project.endDate) : '';
  return months.filter((month) => (!start || month >= start) && (!end || month <= end));
}

function clampedMonthIndex(months: string[], value: string | undefined, fallback: number): number {
  if (!value) { return fallback; }
  const month = firstDayOfMonthIso(value);
  const index = months.indexOf(month);
  if (index >= 0) { return index; }
  if (month < months[0]) { return 0; }
  if (month > months[months.length - 1]) { return months.length - 1; }
  return fallback;
}

export const CapacityPlannerApp: React.FC<ICapacityPlannerAppProps> = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadResult, setLoadResult] = useState<IDataLoadResult>({ snapshot: emptySnapshot(), source: 'mock', warnings: [] });
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<PlannerTab>('dashboard');
  const [matrixMode, setMatrixMode] = useState<MatrixMode>('person');
  const [reportMode, setReportMode] = useState<ReportMode>('person');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [allocationDraft, setAllocationDraft] = useState<{ [key: string]: string }>({});
  const [personForm, setPersonForm] = useState<IPerson>(newPerson());
  const [projectForm, setProjectForm] = useState<IProject>(newProject());
  const [leaveForm, setLeaveForm] = useState<ILeaveEntry>(newLeave([]));
  const [scenarioForm, setScenarioForm] = useState<IScenario>(defaultScenario());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeRepository = loadResult.source === 'sharepoint' ? props.repository : props.fallbackRepository;

  async function load(): Promise<void> {
    setIsLoading(true);
    setError('');
    try {
      const result = await props.repository.loadSnapshot(props.monthsToShow);
      setLoadResult(result);
      initialiseSelection(result.snapshot);
    } catch (err) {
      if (!props.useMockDataWhenListsMissing) {
        setError(err instanceof Error ? err.message : String(err));
      } else {
        const fallback = await props.fallbackRepository.loadSnapshot(props.monthsToShow);
        setLoadResult({ ...fallback, warnings: [err instanceof Error ? err.message : String(err)].concat(fallback.warnings) });
        initialiseSelection(fallback.snapshot);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function initialiseSelection(snapshot: IPlanningSnapshot): void {
    if (snapshot.projects.length > 0 && !selectedProjectId) { setSelectedProjectId(String(snapshot.projects[0].id)); }
    if (snapshot.people.length > 0) { setLeaveForm(newLeave(snapshot.people)); }
    const scenarios = snapshot.scenarios || [defaultScenario()];
    for (let index = 0; index < scenarios.length; index++) {
      if (scenarios[index].isActive || String(scenarios[index].id) === String(snapshot.activeScenarioId)) { setScenarioForm(scenarios[index]); return; }
    }
    setScenarioForm(scenarios[0]);
  }

  useEffect(() => { load().catch((err) => setError(err instanceof Error ? err.message : String(err))); }, [props.monthsToShow]);

  const snapshot = useMemo(() => loadResult.snapshot || emptySnapshot(), [loadResult]);
  const filteredSnapshot = useMemo(() => {
    if (brandFilter === 'All') { return snapshot; }
    const filtered = cloneSnapshot(snapshot);
    filtered.projects = filtered.projects.filter((project) => project.brand === brandFilter);
    filtered.allocations = filtered.allocations.filter((allocation) => getProjectById(filtered.projects, allocation.projectId) !== undefined);
    return filtered;
  }, [snapshot, brandFilter]);
  const selectedProject = getProjectById(snapshot.projects, selectedProjectId);
  const months = buildMonthRange(props.monthsToShow);
  const projectMonths = getProjectMonths(selectedProject, props.monthsToShow);
  const personMonths = buildPersonMonthSummaries(filteredSnapshot, props.monthsToShow);
  const monthSummaries = buildMonthSummaries(filteredSnapshot, props.monthsToShow);
  const projectDemand = buildProjectDemandSummaries(filteredSnapshot);
  const roleMonths = buildRoleMonthSummaries(filteredSnapshot, props.monthsToShow);
  const overloads = buildOverloads(filteredSnapshot, props.monthsToShow);
  const recommendations = buildReallocationRecommendations(filteredSnapshot, props.monthsToShow);

  useEffect(() => {
    if (!selectedProject) { return; }
    const draft: { [key: string]: string } = {};
    snapshot.people.filter((person) => person.isActive).forEach((person) => {
      projectMonths.forEach((month) => {
        const allocation = findProjectAllocation(snapshot, selectedProject.id, person.id, month);
        draft[allocationKey(person.id, month)] = allocation ? String(Math.round(Number(allocation.allocationFte || 0) * 100)) : '';
      });
    });
    setAllocationDraft(draft);
  }, [selectedProjectId, snapshot.allocations.length, snapshot.people.length, projectMonths.length]);

  function replaceSnapshot(nextSnapshot: IPlanningSnapshot): void {
    setLoadResult({ ...loadResult, snapshot: nextSnapshot });
  }

  async function savePerson(): Promise<void> {
    setIsSaving(true);
    try {
      const saved = await activeRepository.savePerson(personForm);
      const next = cloneSnapshot(snapshot);
      next.people = upsertById(next.people, saved);
      replaceSnapshot(next);
      setPersonForm(newPerson());
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function deletePerson(id: number | string): Promise<void> {
    setIsSaving(true);
    try {
      await activeRepository.deletePerson(id);
      const next = cloneSnapshot(snapshot);
      next.people = removeById(next.people, id);
      next.allocations = next.allocations.filter((allocation) => String(allocation.personId) !== String(id));
      replaceSnapshot(next);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function saveProject(): Promise<void> {
    setIsSaving(true);
    try {
      const saved = await activeRepository.saveProject(projectForm);
      const next = cloneSnapshot(snapshot);
      next.projects = upsertById(next.projects, saved);
      replaceSnapshot(next);
      setProjectForm(newProject());
      setSelectedProjectId(String(saved.id));
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function deleteProject(id: number | string): Promise<void> {
    setIsSaving(true);
    try {
      await activeRepository.deleteProject(id);
      const next = cloneSnapshot(snapshot);
      next.projects = removeById(next.projects, id);
      next.allocations = next.allocations.filter((allocation) => String(allocation.projectId) !== String(id));
      replaceSnapshot(next);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function saveLeave(): Promise<void> {
    setIsSaving(true);
    try {
      const saved = await activeRepository.saveLeaveEntry(leaveForm);
      const next = cloneSnapshot(snapshot);
      next.leave = upsertById(next.leave, saved);
      replaceSnapshot(next);
      setLeaveForm(newLeave(next.people));
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function deleteLeave(id: number | string): Promise<void> {
    setIsSaving(true);
    try {
      await activeRepository.deleteLeaveEntry(id);
      const next = cloneSnapshot(snapshot);
      next.leave = removeById(next.leave, id);
      replaceSnapshot(next);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function saveScenario(): Promise<void> {
    setIsSaving(true);
    try {
      const saved = await activeRepository.saveScenario(scenarioForm);
      const next = cloneSnapshot(snapshot);
      next.scenarios = (next.scenarios || []).map((scenario) => ({ ...scenario, isActive: false }));
      saved.isActive = true;
      next.scenarios = upsertById(next.scenarios || [], saved);
      next.activeScenarioId = saved.id;
      replaceSnapshot(next);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  async function saveProjectAllocations(): Promise<void> {
    if (!selectedProject) { return; }
    setIsSaving(true);
    try {
      const changes: IAllocation[] = [];
      snapshot.people.filter((person) => person.isActive).forEach((person) => {
        projectMonths.forEach((month) => {
          const raw = allocationDraft[allocationKey(person.id, month)];
          const percent = Number(raw || 0);
          const existing = findProjectAllocation(snapshot, selectedProject.id, person.id, month);
          if (percent <= 0 && !existing) { return; }
          const capacity = monthlyCapacityWithLeave(snapshot, person, month);
          changes.push({
            id: existing ? existing.id : `new-allocation-${person.id}-${selectedProject.id}-${month}`,
            title: `${person.title} - ${selectedProject.projectCode} - ${month}`,
            personId: person.id,
            projectId: selectedProject.id,
            scenarioId: snapshot.activeScenarioId || 'baseline',
            allocationMonth: month,
            allocationFte: percent / 100,
            allocationHours: Math.round(capacity * percent / 100),
            discipline: person.discipline,
            role: person.primaryRole || person.discipline,
            includeInCapacity: selectedProject.includeInCapacity,
            locked: existing ? existing.locked : false,
            lastModifiedAt: new Date().toISOString(),
            notes: existing ? existing.notes : ''
          });
        });
      });
      const saved = await activeRepository.saveAllocations(changes);
      const next = cloneSnapshot(snapshot);
      saved.forEach((allocation) => { next.allocations = upsertById(next.allocations, allocation); });
      const updatedProject = { ...selectedProject, lastAllocationSavedAt: new Date().toISOString() };
      next.projects = upsertById(next.projects, updatedProject);
      replaceSnapshot(next);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setIsSaving(false); }
  }

  function renderNavButton(tab: PlannerTab, label: string): JSX.Element {
    return <button className={activeTab === tab ? styles.navActive : styles.navButton} onClick={() => setActiveTab(tab)}>{label}</button>;
  }

  function metric(label: string, value: string, hint?: string): JSX.Element {
    return <div className={styles.card}><span className={styles.cardLabel}>{label}</span><strong className={styles.metric}>{value}</strong>{hint && <small>{hint}</small>}</div>;
  }

  function renderDashboard(): JSX.Element {
    const totalAvailable = monthSummaries.reduce((sum, row) => sum + row.availableHours, 0);
    const totalAllocated = monthSummaries.reduce((sum, row) => sum + row.allocatedHours, 0);
    const utilisation = totalAvailable === 0 ? 0 : Math.round(totalAllocated / totalAvailable * 100);
    const headroom = totalAvailable - totalAllocated;
    return <div className={styles.stack}>
      <div className={styles.kpiGrid}>
        {metric('Utilisation', `${utilisation}%`, 'Planning period')}
        {metric(headroom >= 0 ? 'Headroom' : 'Overrun', `${Math.abs(headroom)} h`, headroom >= 0 ? 'Available capacity' : 'Action required')}
        {metric('Person-month overloads', String(overloads.length), 'Above 100% utilisation')}
        {metric('Projects in scope', String(filteredSnapshot.projects.length), brandFilter === 'All' ? 'All brands' : brandFilter)}
      </div>
      <section className={styles.panel}><h3>Capacity vs demand</h3>{renderMonthSummaryTable()}</section>
      <section className={styles.panel}><h3>Portfolio timeline</h3>{renderPortfolioTimeline()}</section>
      <section className={styles.panel}><h3>Scenario assumptions</h3>{renderScenarioForm()}</section>
    </div>;
  }

  function renderMonthSummaryTable(): JSX.Element {
    return <table className={styles.table}><thead><tr><th>Month</th><th>Capacity</th><th>Allocated</th><th>Utilisation</th></tr></thead><tbody>{monthSummaries.map((row) => <tr key={row.month}><td>{monthLabel(row.month)}</td><td>{row.availableHours} h</td><td>{row.allocatedHours} h</td><td><span className={styles[utilisationBand(row.utilisation)]}>{row.utilisation}%</span></td></tr>)}</tbody></table>;
  }

  function renderPortfolioTimeline(): JSX.Element {
    const trackColumns = `repeat(${months.length}, minmax(84px, 1fr))`;
    return <div className={styles.gantt}>
      <div className={styles.ganttHeader}>
        <div className={styles.ganttProjectHeader}>Project</div>
        <div className={styles.ganttMonthHeader} style={{ gridTemplateColumns: trackColumns }}>
          {months.map((month) => <span key={month}>{monthLabel(month)}</span>)}
        </div>
      </div>
      {filteredSnapshot.projects.map((project) => {
        const startIndex = clampedMonthIndex(months, project.startDate, 0);
        const endIndex = clampedMonthIndex(months, project.endDate, months.length - 1);
        const left = Math.max(0, Math.min(startIndex, endIndex));
        const right = Math.min(months.length - 1, Math.max(startIndex, endIndex));
        const gridColumn = `${left + 1} / ${right + 2}`;
        const title = `${project.title} · ${project.brand} · ${project.status}`;
        const range = `${monthLabel(project.startDate || months[0])} to ${monthLabel(project.endDate || months[months.length - 1])}`;
        return <div key={String(project.id)} className={styles.ganttRow}>
          <div className={styles.ganttProject}><strong>{project.projectCode}</strong><span>{project.title}</span></div>
          <div className={styles.ganttTrack} style={{ gridTemplateColumns: trackColumns }}>
            {months.map((month) => <div key={`${project.id}-${month}`} className={styles.ganttCell} />)}
            <div className={project.projectType === 'Opportunity' ? styles.ganttOpportunity : styles.ganttBar} style={{ gridColumn }} title={`${title} (${range})`}>
              <span>{title}</span><small>{range}</small>
            </div>
          </div>
        </div>;
      })}
    </div>;
  }

  function renderScenarioForm(): JSX.Element {
    const assumptions = scenarioForm.assumptions || defaultScenario().assumptions;
    const updateAssumption = (field: keyof ICapacityAssumptions, value: number | string): void => setScenarioForm({ ...scenarioForm, assumptions: { ...assumptions, [field]: value } as ICapacityAssumptions });
    return <div className={styles.formGrid}>
      <label>Scenario name<input className={styles.input} value={scenarioForm.title} onChange={(e) => setScenarioForm({ ...scenarioForm, title: e.currentTarget.value })} /></label>
      <label>Leave model<select className={styles.input} value={assumptions.leaveModel} onChange={(e) => updateAssumption('leaveModel', e.currentTarget.value)}><option value="fixed-days">Fixed days</option><option value="pro-rated">Pro-rated</option></select></label>
      <label>Full-time hours/week<input className={styles.input} type="number" value={assumptions.fullTimeHoursPerWeek} onChange={(e) => updateAssumption('fullTimeHoursPerWeek', Number(e.currentTarget.value))} /></label>
      <label>Leave days/year<input className={styles.input} type="number" value={assumptions.defaultLeaveDaysPerYear} onChange={(e) => updateAssumption('defaultLeaveDaysPerYear', Number(e.currentTarget.value))} /></label>
      <label>Public holidays/year<input className={styles.input} type="number" value={assumptions.publicHolidayDaysPerYear} onChange={(e) => updateAssumption('publicHolidayDaysPerYear', Number(e.currentTarget.value))} /></label>
      <label>Admin allowance %<input className={styles.input} type="number" value={assumptions.adminManagementAllowancePercent} onChange={(e) => updateAssumption('adminManagementAllowancePercent', Number(e.currentTarget.value))} /></label>
      <button className={styles.primaryButton} onClick={saveScenario} disabled={isSaving}>Save scenario</button>
    </div>;
  }

  function renderTeam(): JSX.Element {
    return <div className={styles.twoColumn}><section className={styles.panel}><h3>Team</h3><table className={styles.table}><thead><tr><th>Name</th><th>Role</th><th>Contract</th><th>Monthly capacity</th><th>Active</th><th></th></tr></thead><tbody>{snapshot.people.map((person) => <tr key={String(person.id)}><td>{person.title}</td><td>{person.primaryRole || person.discipline}</td><td>{person.weeklyHours} h / {person.workingDaysPerWeek || 5} days</td><td>{monthlyCapacityHours(person, getActiveAssumptions(snapshot))} h</td><td>{person.isActive ? 'Yes' : 'No'}</td><td><button className={styles.linkButton} onClick={() => setPersonForm(person)}>Edit</button><button className={styles.linkButton} onClick={() => deletePerson(person.id)}>Delete</button></td></tr>)}</tbody></table></section><section className={styles.panel}>{renderPersonForm()}</section></div>;
  }

  function renderPersonForm(): JSX.Element {
    return <><h3>{String(personForm.id).indexOf('new-') === 0 ? 'Add person' : 'Edit person'}</h3><div className={styles.formGrid}>
      <label>Name<input className={styles.input} value={personForm.title} onChange={(e) => setPersonForm({ ...personForm, title: e.currentTarget.value })} /></label>
      <label>Email<input className={styles.input} value={personForm.email} onChange={(e) => setPersonForm({ ...personForm, email: e.currentTarget.value })} /></label>
      <label>Role<select className={styles.input} value={personForm.primaryRole || personForm.discipline} onChange={(e) => setPersonForm({ ...personForm, primaryRole: e.currentTarget.value, discipline: e.currentTarget.value, role: e.currentTarget.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
      <label>Employment<select className={styles.input} value={personForm.employmentType} onChange={(e) => setPersonForm({ ...personForm, employmentType: e.currentTarget.value as any })}><option>Employee</option><option>Freelancer</option></select></label>
      <label>Weekly hours<input className={styles.input} type="number" value={personForm.weeklyHours} onChange={(e) => setPersonForm({ ...personForm, weeklyHours: Number(e.currentTarget.value) })} /></label>
      <label>Working days/week<input className={styles.input} type="number" value={personForm.workingDaysPerWeek || 5} onChange={(e) => setPersonForm({ ...personForm, workingDaysPerWeek: Number(e.currentTarget.value) })} /></label>
      <label>Active<select className={styles.input} value={personForm.isActive ? 'Yes' : 'No'} onChange={(e) => setPersonForm({ ...personForm, isActive: e.currentTarget.value === 'Yes' })}><option>Yes</option><option>No</option></select></label>
      <button className={styles.primaryButton} onClick={savePerson} disabled={isSaving || !personForm.title}>Save person</button><button className={styles.secondaryButton} onClick={() => setPersonForm(newPerson())}>New person</button>
    </div></>;
  }

  function renderLeave(): JSX.Element {
    const currentMonth = firstDayOfMonthIso(new Date());
    const outThisMonth = snapshot.leave.filter((entry) => firstDayOfMonthIso(entry.leaveDate) === currentMonth);
    return <div className={styles.stack}><section className={styles.panel}><h3>Who's out this month</h3><div className={styles.chips}>{outThisMonth.map((entry) => <span key={String(entry.id)} className={styles.chip}>{(getPersonById(snapshot.people, entry.personId) || { title: 'Unknown' }).title}: {entry.leaveType} · {entry.leaveHours}h</span>)}</div></section><div className={styles.twoColumn}><section className={styles.panel}>{renderLeaveGrid()}</section><section className={styles.panel}>{renderLeaveForm()}</section></div><section className={styles.panel}>{renderLeaveList()}</section></div>;
  }

  function renderLeaveGrid(): JSX.Element {
    return <><h3>Monthly leave grid</h3><table className={styles.matrix}><thead><tr><th>Person</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead><tbody>{snapshot.people.map((person) => <tr key={String(person.id)}><th>{person.title}</th>{months.map((month) => { const hours = snapshot.leave.filter((entry) => String(entry.personId) === String(person.id) && firstDayOfMonthIso(entry.leaveDate) === month).reduce((sum, entry) => sum + entry.leaveHours, 0); return <td key={month} className={hours > 0 ? styles.leaveCell : ''}>{hours > 0 ? `${hours}h` : ''}</td>; })}</tr>)}</tbody></table></>;
  }

  function renderLeaveForm(): JSX.Element {
    return <><h3>Add / edit leave</h3><div className={styles.formGrid}><label>Person<select className={styles.input} value={String(leaveForm.personId)} onChange={(e) => setLeaveForm({ ...leaveForm, personId: e.currentTarget.value })}>{snapshot.people.map((person) => <option key={String(person.id)} value={String(person.id)}>{person.title}</option>)}</select></label><label>Month<input className={styles.input} type="date" value={leaveForm.leaveDate ? leaveForm.leaveDate.substring(0, 10) : ''} onChange={(e) => setLeaveForm({ ...leaveForm, leaveDate: firstDayOfMonthIso(e.currentTarget.value) })} /></label><label>Type<select className={styles.input} value={leaveForm.leaveType} onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.currentTarget.value as LeaveType })}>{leaveTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Hours<input className={styles.input} type="number" value={leaveForm.leaveHours} onChange={(e) => setLeaveForm({ ...leaveForm, leaveHours: Number(e.currentTarget.value) })} /></label><label>Notes<input className={styles.input} value={leaveForm.notes || ''} onChange={(e) => setLeaveForm({ ...leaveForm, notes: e.currentTarget.value })} /></label><button className={styles.primaryButton} onClick={saveLeave} disabled={isSaving}>Save leave</button></div></>;
  }

  function renderLeaveList(): JSX.Element {
    return <><h3>Leave entries</h3><table className={styles.table}><thead><tr><th>Month</th><th>Person</th><th>Type</th><th>Hours</th><th>Notes</th><th></th></tr></thead><tbody>{snapshot.leave.map((entry) => <tr key={String(entry.id)}><td>{monthLabel(entry.leaveDate)}</td><td>{(getPersonById(snapshot.people, entry.personId) || { title: 'Unknown' }).title}</td><td>{entry.leaveType}</td><td>{entry.leaveHours}</td><td>{entry.notes}</td><td><button className={styles.linkButton} onClick={() => setLeaveForm(entry)}>Edit</button><button className={styles.linkButton} onClick={() => deleteLeave(entry.id)}>Delete</button></td></tr>)}</tbody></table></>;
  }

  function renderProjects(): JSX.Element {
    return <div className={styles.twoColumn}><section className={styles.panel}><h3>Projects</h3><table className={styles.table}><thead><tr><th>Code</th><th>Project</th><th>Brand</th><th>Type</th><th>Status</th><th>Included</th><th>Hours</th><th></th></tr></thead><tbody>{snapshot.projects.map((project) => { const demand = buildProjectDemandSummaries(snapshot).filter((row) => String(row.projectId) === String(project.id))[0]; return <tr key={String(project.id)}><td>{project.projectCode}</td><td>{project.title}<small>{project.lastAllocationSavedAt ? `Last allocation save: ${project.lastAllocationSavedAt}` : ''}</small></td><td>{project.brand}</td><td><span className={styles.badge}>{project.projectType}</span></td><td>{project.status}</td><td>{project.includeInCapacity ? 'Yes' : 'No'}</td><td>{demand ? demand.includedHours : 0} h</td><td><button className={styles.linkButton} onClick={() => { setProjectForm(project); setSelectedProjectId(String(project.id)); }}>Edit</button><button className={styles.linkButton} onClick={() => { setSelectedProjectId(String(project.id)); setActiveTab('allocate'); }}>Allocate</button><button className={styles.linkButton} onClick={() => deleteProject(project.id)}>Delete</button></td></tr>; })}</tbody></table></section><section className={styles.panel}>{renderProjectForm()}</section></div>;
  }

  function renderProjectForm(): JSX.Element {
    return <><h3>{String(projectForm.id).indexOf('new-') === 0 ? 'Add project' : 'Edit project'}</h3><div className={styles.formGrid}><label>Code<input className={styles.input} value={projectForm.projectCode} onChange={(e) => setProjectForm({ ...projectForm, projectCode: e.currentTarget.value })} /></label><label>Name<input className={styles.input} value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.currentTarget.value })} /></label><label>Brand<select className={styles.input} value={projectForm.brand || 'DCT'} onChange={(e) => setProjectForm({ ...projectForm, brand: e.currentTarget.value as any })}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label><label>Type<select className={styles.input} value={projectForm.projectType} onChange={(e) => setProjectForm({ ...projectForm, projectType: e.currentTarget.value as ProjectType })}>{projectTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Status<select className={styles.input} value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.currentTarget.value as ProjectStatus })}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Priority<select className={styles.input} value={projectForm.priority || 'Normal'} onChange={(e) => setProjectForm({ ...projectForm, priority: e.currentTarget.value as any })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label><label>Start<input className={styles.input} type="date" value={projectForm.startDate ? projectForm.startDate.substring(0, 10) : ''} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.currentTarget.value })} /></label><label>End<input className={styles.input} type="date" value={projectForm.endDate ? projectForm.endDate.substring(0, 10) : ''} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.currentTarget.value })} /></label><label>Include in capacity<select className={styles.input} value={projectForm.includeInCapacity ? 'Yes' : 'No'} onChange={(e) => setProjectForm({ ...projectForm, includeInCapacity: e.currentTarget.value === 'Yes' })}><option>Yes</option><option>No</option></select></label><label>Probability %<input className={styles.input} type="number" value={projectForm.probability || 0} onChange={(e) => setProjectForm({ ...projectForm, probability: Number(e.currentTarget.value) })} /></label><label className={styles.wide}>Notes<input className={styles.input} value={projectForm.notes || ''} onChange={(e) => setProjectForm({ ...projectForm, notes: e.currentTarget.value })} /></label><button className={styles.primaryButton} onClick={saveProject} disabled={isSaving || !projectForm.title}>Save project</button><button className={styles.secondaryButton} onClick={() => setProjectForm(newProject())}>New project</button></div></>;
  }

  function renderAllocationEditor(): JSX.Element {
    return <section className={styles.panel}><div className={styles.toolbar}><h3>Project Allocation Editor</h3><select className={styles.input} value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.currentTarget.value)}>{snapshot.projects.map((project) => <option key={String(project.id)} value={String(project.id)}>{project.projectCode} · {project.title}</option>)}</select><button className={styles.primaryButton} onClick={saveProjectAllocations} disabled={!selectedProject || isSaving}>Save allocations</button></div>{selectedProject && <p className={styles.subtle}>{selectedProject.projectCode} · {selectedProject.title} · {selectedProject.projectType} · {selectedProject.includeInCapacity ? 'included in capacity' : 'excluded from capacity'}</p>}<table className={styles.matrix}><thead><tr><th>Person</th>{projectMonths.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead><tbody>{snapshot.people.filter((person) => person.isActive).map((person) => <tr key={String(person.id)}><th>{person.title}<small>{person.primaryRole || person.discipline}</small></th>{projectMonths.map((month) => { const key = allocationKey(person.id, month); const percent = Number(allocationDraft[key] || 0); const hours = Math.round(monthlyCapacityWithLeave(snapshot, person, month) * percent / 100); return <td key={key} className={styles[utilisationBand(percent)]}><input className={styles.matrixInput} type="number" min="0" max="200" value={allocationDraft[key] || ''} onChange={(e) => setAllocationDraft({ ...allocationDraft, [key]: e.currentTarget.value })} /><small>{hours} h</small></td>; })}</tr>)}</tbody><tfoot><tr><th>Total hours</th>{projectMonths.map((month) => { const total = snapshot.people.filter((person) => person.isActive).reduce((sum, person) => { const percent = Number(allocationDraft[allocationKey(person.id, month)] || 0); return sum + Math.round(monthlyCapacityWithLeave(snapshot, person, month) * percent / 100); }, 0); return <th key={month}>{total} h</th>; })}</tr></tfoot></table></section>;
  }

  function renderPlanning(): JSX.Element {
    return <section className={styles.panel}><div className={styles.toolbar}><h3>Planning matrix</h3><button className={matrixMode === 'person' ? styles.navActive : styles.navButton} onClick={() => setMatrixMode('person')}>By person</button><button className={matrixMode === 'project' ? styles.navActive : styles.navButton} onClick={() => setMatrixMode('project')}>By project</button><button className={matrixMode === 'role' ? styles.navActive : styles.navButton} onClick={() => setMatrixMode('role')}>By role</button></div>{matrixMode === 'person' && renderPersonMatrix()}{matrixMode === 'project' && renderProjectMatrix()}{matrixMode === 'role' && renderRoleMatrix()}</section>;
  }

  function renderPersonMatrix(): JSX.Element {
    return <table className={styles.matrix}><thead><tr><th>Person</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead><tbody>{snapshot.people.filter((person) => person.isActive).map((person) => <tr key={String(person.id)}><th>{person.title}<small>{person.primaryRole || person.discipline}</small></th>{months.map((month) => { const row = personMonths.filter((item) => String(item.personId) === String(person.id) && item.month === month)[0]; return <td key={month} className={row ? styles[utilisationBand(row.utilisation)] : ''}>{row ? <>{row.allocatedHours} / {row.availableHours} h<br /><strong>{row.utilisation}%</strong></> : ''}</td>; })}</tr>)}</tbody></table>;
  }

  function renderProjectMatrix(): JSX.Element {
    return <table className={styles.matrix}><thead><tr><th>Project</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead><tbody>{snapshot.projects.map((project) => <tr key={String(project.id)}><th>{project.projectCode}<small>{project.title}</small></th>{months.map((month) => { const hours = snapshot.allocations.filter((allocation) => String(allocation.projectId) === String(project.id) && firstDayOfMonthIso(allocation.allocationMonth) === month).reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(snapshot.people, allocation.personId), snapshot), 0); return <td key={month}>{hours > 0 ? `${hours} h` : ''}</td>; })}</tr>)}</tbody></table>;
  }

  function renderRoleMatrix(): JSX.Element {
    const roleNames: string[] = [];
    roleMonths.forEach((row) => { if (roleNames.indexOf(row.role) < 0) { roleNames.push(row.role); } });
    return <table className={styles.matrix}><thead><tr><th>Role</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead><tbody>{roleNames.map((role) => <tr key={role}><th>{role}</th>{months.map((month) => { const row = roleMonths.filter((item) => item.role === role && item.month === month)[0]; return <td key={month} className={row ? styles[utilisationBand(row.utilisation)] : ''}>{row ? <>{row.allocatedHours} / {row.availableHours} h<br /><strong>{row.utilisation}%</strong></> : ''}</td>; })}</tr>)}</tbody></table>;
  }

  function renderOptimisation(): JSX.Element {
    const residual = overloads.reduce((sum, row) => sum + row.overloadHours, 0) - recommendations.reduce((sum, row) => sum + row.suggestedHours, 0);
    return <div className={styles.stack}><div className={styles.kpiGrid}>{metric('Overload hours', String(overloads.reduce((sum, row) => sum + row.overloadHours, 0)), 'Before mitigation')}{metric('Suggested moves', String(recommendations.length), 'Same-role capacity')}{metric('Residual contractor need', `${Math.max(residual, 0)} h`, `${Math.round(Math.max(residual, 0) / 133 * 10) / 10} FTE months`)}</div><section className={styles.panel}><h3>Person-month overloads</h3><table className={styles.table}><thead><tr><th>Month</th><th>Person</th><th>Role</th><th>Allocated</th><th>Available</th><th>Overload</th></tr></thead><tbody>{overloads.map((row) => <tr key={`${row.personId}-${row.month}`}><td>{monthLabel(row.month)}</td><td>{row.personName}</td><td>{row.role}</td><td>{row.allocatedHours} h</td><td>{row.availableHours} h</td><td className={styles.critical}>{row.overloadHours} h</td></tr>)}</tbody></table></section><section className={styles.panel}><h3>Reallocation recommendations</h3><table className={styles.table}><thead><tr><th>Month</th><th>Move from</th><th>Move to</th><th>Role</th><th>Hours</th><th>Reason</th></tr></thead><tbody>{recommendations.map((row, index) => <tr key={index}><td>{monthLabel(row.month)}</td><td>{row.fromPersonName}</td><td>{row.toPersonName}</td><td>{row.role}</td><td>{row.suggestedHours}</td><td>{row.reason}</td></tr>)}</tbody></table></section></div>;
  }

  function renderReports(): JSX.Element {
    return <div className={styles.stack}><section className={styles.panel}><div className={styles.toolbar}><h3>Reports</h3>{(['person', 'role', 'brand', 'projects', 'overloads'] as ReportMode[]).map((mode) => <button key={mode} className={reportMode === mode ? styles.navActive : styles.navButton} onClick={() => setReportMode(mode)}>{mode}</button>)}<button className={styles.secondaryButton} onClick={() => downloadText('person-utilisation.csv', exportPersonCsv(filteredSnapshot, props.monthsToShow), 'text/csv')}>Export person CSV</button><button className={styles.secondaryButton} onClick={() => downloadText('planning-data.json', JSON.stringify(filteredSnapshot, null, 2), 'application/json')}>Export JSON</button></div>{reportMode === 'person' && renderPersonMatrix()}{reportMode === 'role' && renderRoleMatrix()}{reportMode === 'brand' && renderBrandReport()}{reportMode === 'projects' && renderProjectDemandTable()}{reportMode === 'overloads' && renderOptimisation()}</section></div>;
  }

  function renderBrandReport(): JSX.Element {
    return <table className={styles.table}><thead><tr><th>Brand</th><th>Hours</th></tr></thead><tbody>{brands.map((brand) => { const projects = snapshot.projects.filter((project) => project.brand === brand); const hours = snapshot.allocations.filter((allocation) => getProjectById(projects, allocation.projectId) !== undefined).reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(snapshot.people, allocation.personId), snapshot), 0); return <tr key={brand}><td>{brand}</td><td>{hours} h</td></tr>; })}</tbody></table>;
  }

  function renderProjectDemandTable(): JSX.Element {
    return <table className={styles.table}><thead><tr><th>Code</th><th>Project</th><th>Brand</th><th>Type</th><th>Total hours</th><th>Included hours</th></tr></thead><tbody>{projectDemand.map((row) => <tr key={String(row.projectId)}><td>{row.projectCode}</td><td>{row.projectTitle}</td><td>{row.brand}</td><td>{row.projectType}</td><td>{row.totalHours}</td><td>{row.includedHours}</td></tr>)}</tbody></table>;
  }

  function renderData(): JSX.Element {
    return <section className={styles.panel}><h3>Data and setup</h3><p>This SPFx version stores live data in site-scoped SharePoint Lists. If the ERP_* lists are missing, the app falls back to mock data for layout and workflow testing.</p><pre className={styles.code}>{JSON.stringify({ source: loadResult.source, people: snapshot.people.length, projects: snapshot.projects.length, allocations: snapshot.allocations.length, leave: snapshot.leave.length }, null, 2)}</pre></section>;
  }

  if (isLoading) { return <div className={styles.app}><Spinner label="Loading capacity planner" size={SpinnerSize.large} /></div>; }

  return <section className={styles.app}>
    <header className={styles.header}><div><p className={styles.eyebrow}>SharePoint-native resource planning</p><h2>{props.title}</h2><p className={styles.subtle}>Site: {props.siteUrl}</p></div><div className={styles.userBox}><span>{props.currentUserDisplayName}</span><small>{props.currentUserEmail}</small></div></header>
    {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
    {isSaving && <MessageBar messageBarType={MessageBarType.info}>Saving changes...</MessageBar>}
    {loadResult.source === 'mock' && <MessageBar messageBarType={MessageBarType.warning}>Using mock data until the SharePoint ERP_* lists are provisioned.</MessageBar>}
    {loadResult.warnings.map((warning, index) => <MessageBar key={index} messageBarType={MessageBarType.info}>{warning}</MessageBar>)}
    <div className={styles.toolbar}><label>Brand filter <select className={styles.input} value={brandFilter} onChange={(e) => setBrandFilter(e.currentTarget.value)}><option>All</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label><button className={styles.secondaryButton} onClick={() => load()}>Reload</button></div>
    <nav className={styles.nav}>{renderNavButton('dashboard', 'Dashboard')}{renderNavButton('team', 'Team')}{renderNavButton('leave', 'Leave')}{renderNavButton('projects', 'Projects')}{renderNavButton('allocate', 'Allocate')}{renderNavButton('planning', 'Planning')}{renderNavButton('optimisation', 'Optimisation')}{renderNavButton('reports', 'Reports')}{renderNavButton('data', 'Data')}</nav>
    {activeTab === 'dashboard' && renderDashboard()}
    {activeTab === 'team' && renderTeam()}
    {activeTab === 'leave' && renderLeave()}
    {activeTab === 'projects' && renderProjects()}
    {activeTab === 'allocate' && renderAllocationEditor()}
    {activeTab === 'planning' && renderPlanning()}
    {activeTab === 'optimisation' && renderOptimisation()}
    {activeTab === 'reports' && renderReports()}
    {activeTab === 'data' && renderData()}
  </section>;
};
