import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./student-manage-payments.component').then(m => m.StudentManagePaymentsComponent),
    },
] as Routes;