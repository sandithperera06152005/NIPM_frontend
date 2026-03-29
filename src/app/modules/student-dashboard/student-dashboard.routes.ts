import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
    {
        path: '',
        loadComponent: () => import('./student-dashboard.component').then(m => m.StudentDashboardComponent),
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_STUDENT'] }
    },
    {
        path: 'manage-payments',
        loadChildren: () => import('./student-manage-payments.routes').then(m => m.default),
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_STUDENT'] }
    },
] as Routes;