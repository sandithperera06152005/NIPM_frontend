import { Routes } from '@angular/router';
import { VoucherComponent } from './voucher.component';

export const VoucherRoutes: Routes = [
  {
    path: '',
    component: VoucherComponent,
    children: []
  }
];
