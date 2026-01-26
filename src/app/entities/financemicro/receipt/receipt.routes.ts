import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ReceiptResolve from './route/receipt-routing-resolve.service';

const receiptRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/receipt.component').then(m => m.ReceiptComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/receipt-detail.component').then(m => m.ReceiptDetailComponent),
    resolve: {
      receipt: ReceiptResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/receipt-update.component').then(m => m.ReceiptUpdateComponent),
    resolve: {
      receipt: ReceiptResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/receipt-update.component').then(m => m.ReceiptUpdateComponent),
    resolve: {
      receipt: ReceiptResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default receiptRoute;
