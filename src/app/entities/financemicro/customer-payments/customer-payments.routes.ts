import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import CustomerPaymentsResolve from './route/customer-payments-routing-resolve.service';

const customerPaymentsRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/customer-payments.component').then(m => m.CustomerPaymentsComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/customer-payments-detail.component').then(m => m.CustomerPaymentsDetailComponent),
    resolve: {
      customerPayments: CustomerPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/customer-payments-update.component').then(m => m.CustomerPaymentsUpdateComponent),
    resolve: {
      customerPayments: CustomerPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/customer-payments-update.component').then(m => m.CustomerPaymentsUpdateComponent),
    resolve: {
      customerPayments: CustomerPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default customerPaymentsRoute;
