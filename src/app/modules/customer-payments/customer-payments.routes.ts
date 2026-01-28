import { Routes } from '@angular/router';
import { CustomerPaymentsComponent } from './customer-payments.component';

export const CustomerPaymentsRoutes: Routes = [
  {
    path: '',
    component: CustomerPaymentsComponent,
    children: []
  }
];