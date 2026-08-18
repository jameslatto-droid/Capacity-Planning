import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pivot, PivotItem, MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';

import { ICapacityPlannerAppProps } from './ICapacityPlannerAppProps';
import { IDataLoadResult, IPlanningSnapshot } from '../models/ResourcePlanningModels';
import { emptySnapshot } from '../services/IResourcePlanningRepository';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { PeopleView } from './views/PeopleView';
import { AllocationsView } from './views/AllocationsView';
import { ReportsView } from './views/ReportsView';
import { LeaveView } from './views/LeaveView';
import styles from './CapacityPlannerApp.module.scss';

export const CapacityPlannerApp: React.FC<ICapacityPlannerAppProps> = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadResult, setLoadResult] = useState<IDataLoadResult>({ snapshot: emptySnapshot(), source: 'mock', warnings: [] });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function load(): Promise<void> {
      setIsLoading(true);
      setError('');
      try {
        const result = await props.repository.loadSnapshot(props.monthsToShow);
        if (isMounted) { setLoadResult(result); }
      } catch (err) {
        if (!props.useMockDataWhenListsMissing) {
          if (isMounted) { setError(err instanceof Error ? err.message : String(err)); }
          return;
        }
        const fallback = await props.fallbackRepository.loadSnapshot(props.monthsToShow);
        if (isMounted) {
          setLoadResult({ ...fallback, warnings: [err instanceof Error ? err.message : String(err), ...fallback.warnings] });
        }
      } finally {
        if (isMounted) { setIsLoading(false); }
      }
    }
    load().catch((err) => setError(err instanceof Error ? err.message : String(err)));
    return () => { isMounted = false; };
  }, [props.monthsToShow, props.repository, props.fallbackRepository, props.useMockDataWhenListsMissing]);

  const snapshot: IPlanningSnapshot = useMemo(() => loadResult.snapshot, [loadResult]);

  if (isLoading) {
    return <div className={styles.app}><Spinner label="Loading capacity planner" size={SpinnerSize.large} /></div>;
  }

  return (
    <section className={styles.app}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SharePoint-native resource planning</p>
          <h2>{props.title}</h2>
          <p className={styles.subtle}>Site: {props.siteUrl}</p>
        </div>
        <div className={styles.userBox}>
          <span>{props.currentUserDisplayName}</span>
          <small>{props.currentUserEmail}</small>
        </div>
      </header>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
      {loadResult.source === 'mock' && <MessageBar messageBarType={MessageBarType.warning}>Using mock data until the SharePoint ERP_* lists are provisioned.</MessageBar>}
      {loadResult.warnings.map((warning, index) => <MessageBar key={index} messageBarType={MessageBarType.info}>{warning}</MessageBar>)}

      <Pivot>
        <PivotItem headerText="Dashboard"><DashboardView snapshot={snapshot} monthsToShow={props.monthsToShow} /></PivotItem>
        <PivotItem headerText="Projects"><ProjectsView projects={snapshot.projects} /></PivotItem>
        <PivotItem headerText="People"><PeopleView people={snapshot.people} /></PivotItem>
        <PivotItem headerText="Allocations"><AllocationsView snapshot={snapshot} monthsToShow={props.monthsToShow} /></PivotItem>
        <PivotItem headerText="Reports"><ReportsView snapshot={snapshot} monthsToShow={props.monthsToShow} /></PivotItem>
        <PivotItem headerText="Leave"><LeaveView people={snapshot.people} leave={snapshot.leave} /></PivotItem>
      </Pivot>
    </section>
  );
};
