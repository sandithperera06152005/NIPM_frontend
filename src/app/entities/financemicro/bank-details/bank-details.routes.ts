import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import BankDetailsResolve from './route/bank-details-routing-resolve.service';

const bankDetailsRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/bank-details.component').then(m => m.BankDetailsComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/bank-details-detail.component').then(m => m.BankDetailsDetailComponent),
    resolve: {
      bankDetails: BankDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/bank-details-update.component').then(m => m.BankDetailsUpdateComponent),
    resolve: {
      bankDetails: BankDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/bank-details-update.component').then(m => m.BankDetailsUpdateComponent),
    resolve: {
      bankDetails: BankDetailsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default bankDetailsRoute;
