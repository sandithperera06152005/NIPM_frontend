import { Routes } from '@angular/router';
import { VendorPaymentsComponent } from './vendor-payments.component';

export const VendorPaymentsRoutes: Routes = [
  {
    path: '',
    component: VendorPaymentsComponent,
    children: []
  }
];