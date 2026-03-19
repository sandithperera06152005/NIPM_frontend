import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./student-dashboard.component').then(m => m.StudentDashboardComponent),
    },
    {
        path: 'manage-payments',
        loadChildren: () => import('./student-manage-payments.routes').then(m => m.default),
    },
] as Routes;