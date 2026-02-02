import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import EmploymentResolve from './route/employment-routing-resolve.service';

const employmentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/employment.component').then(m => m.EmploymentComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/employment-detail.component').then(m => m.EmploymentDetailComponent),
    resolve: {
      employment: EmploymentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/employment-update.component').then(m => m.EmploymentUpdateComponent),
    resolve: {
      employment: EmploymentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/employment-update.component').then(m => m.EmploymentUpdateComponent),
    resolve: {
      employment: EmploymentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default employmentRoute;
