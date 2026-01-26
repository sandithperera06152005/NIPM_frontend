import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ChequeRegistryResolve from './route/cheque-registry-routing-resolve.service';

const chequeRegistryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/cheque-registry.component').then(m => m.ChequeRegistryComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/cheque-registry-detail.component').then(m => m.ChequeRegistryDetailComponent),
    resolve: {
      chequeRegistry: ChequeRegistryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/cheque-registry-update.component').then(m => m.ChequeRegistryUpdateComponent),
    resolve: {
      chequeRegistry: ChequeRegistryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/cheque-registry-update.component').then(m => m.ChequeRegistryUpdateComponent),
    resolve: {
      chequeRegistry: ChequeRegistryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default chequeRegistryRoute;
