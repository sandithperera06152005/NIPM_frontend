import { Routes } from '@angular/router';
import { BankAccountsComponent } from './bank-accounts.component';

export const BankAccountsRoutes: Routes = [
  {
    path: '',
    component: BankAccountsComponent,
    children: []
  }
];