import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ResourcesPage } from '../features/resources/ResourcesPage';
import { LeavePage } from '../features/leave/LeavePage';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import { ProjectAllocationEditor } from '../features/projects/ProjectAllocationEditor';
import { AllocationsPage } from '../features/allocations/AllocationsPage';
import { OptimisationPage } from '../features/optimisation/OptimisationPage';
import { ReportsPage } from '../features/reports/ReportsPage';
export function AppRoutes() {
    return (React.createElement(Routes, null,
        React.createElement(Route, { path: "/", element: React.createElement(DashboardPage, null) }),
        React.createElement(Route, { path: "/resources", element: React.createElement(ResourcesPage, null) }),
        React.createElement(Route, { path: "/leave", element: React.createElement(LeavePage, null) }),
        React.createElement(Route, { path: "/projects", element: React.createElement(ProjectsPage, null) }),
        React.createElement(Route, { path: "/projects/:projectId/allocations", element: React.createElement(ProjectAllocationEditor, null) }),
        React.createElement(Route, { path: "/allocations", element: React.createElement(AllocationsPage, null) }),
        React.createElement(Route, { path: "/optimisation", element: React.createElement(OptimisationPage, null) }),
        React.createElement(Route, { path: "/reports", element: React.createElement(ReportsPage, null) })));
}
//# sourceMappingURL=routes.js.map