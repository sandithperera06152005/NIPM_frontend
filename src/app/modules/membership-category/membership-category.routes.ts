import { Routes } from '@angular/router';
import { MembershipCategoryListComponent } from './list/membership-category-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: MembershipCategoryListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_MEMBER_COORDINATOR', 'ROLE_ADMIN'] }
  },

] as Routes;
