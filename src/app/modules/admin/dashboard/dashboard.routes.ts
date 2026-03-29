import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { DashboardComponent } from './dashboard.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_MEMBER_COORDINATOR', 'ROLE_STUDENT_COORDINATOR', 'ROLE_APPROVER', 'ROLE_COURSE_ADMIN', 'ROLE_FINANCE_MANAGER'] }
    },
] as Routes;
