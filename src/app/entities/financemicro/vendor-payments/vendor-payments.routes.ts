import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import VendorPaymentsResolve from './route/vendor-payments-routing-resolve.service';

const vendorPaymentsRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/vendor-payments.component').then(m => m.VendorPaymentsComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/vendor-payments-detail.component').then(m => m.VendorPaymentsDetailComponent),
    resolve: {
      vendorPayments: VendorPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/vendor-payments-update.component').then(m => m.VendorPaymentsUpdateComponent),
    resolve: {
      vendorPayments: VendorPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/vendor-payments-update.component').then(m => m.VendorPaymentsUpdateComponent),
    resolve: {
      vendorPayments: VendorPaymentsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default vendorPaymentsRoute;
