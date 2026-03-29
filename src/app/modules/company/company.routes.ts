import { Routes } from '@angular/router';
import { CompanyListComponent } from './list/company-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: CompanyListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN'] }
  },

] as Routes;
