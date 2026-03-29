import { Routes } from '@angular/router';
import { InvoiceListComponent } from './list/invoice-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: InvoiceListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER'] }
  },

] as Routes;
