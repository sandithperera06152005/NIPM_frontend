import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import JournalVoucherResolve from './route/journal-voucher-routing-resolve.service';

const journalVoucherRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/journal-voucher.component').then(m => m.JournalVoucherComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/journal-voucher-detail.component').then(m => m.JournalVoucherDetailComponent),
    resolve: {
      journalVoucher: JournalVoucherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/journal-voucher-update.component').then(m => m.JournalVoucherUpdateComponent),
    resolve: {
      journalVoucher: JournalVoucherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/journal-voucher-update.component').then(m => m.JournalVoucherUpdateComponent),
    resolve: {
      journalVoucher: JournalVoucherResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default journalVoucherRoute;
