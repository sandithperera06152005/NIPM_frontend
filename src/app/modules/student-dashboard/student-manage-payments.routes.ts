import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
    {
        path: '',
        loadComponent: () => import('./student-manage-payments.component').then(m => m.StudentManagePaymentsComponent),
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_STUDENT'] }
    },
] as Routes;