import { Routes } from '@angular/router';
import { ApprovalsComponent } from './approvals.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
    {
        path: '',
        component: ApprovalsComponent,
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_APPROVER', 'ROLE_ADMIN'] }
    },
] as Routes;
