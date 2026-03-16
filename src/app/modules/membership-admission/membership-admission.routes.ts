import { Routes } from '@angular/router';
import { MembershipAdmissionListComponent } from './list/membership-admission-list.component';
import { MembershipFormComponent } from './form/membership-form.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: MembershipAdmissionListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_MEMBER_COORDINATOR'] }
  },
  {
    path: 'new',
    component: MembershipFormComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_MEMBER_COORDINATOR'] }
  },
  {
    path: ':id',
    component: MembershipFormComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_MEMBER_COORDINATOR'] }
  }

] as Routes;
