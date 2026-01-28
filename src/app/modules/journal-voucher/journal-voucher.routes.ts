import { Routes } from '@angular/router';
import { JournalVoucherComponent } from './journal-voucher.component';

export const JournalVoucherRoutes: Routes = [
  {
    path: '',
    component: JournalVoucherComponent,
    children: []
  }
];