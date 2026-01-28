import { Routes } from '@angular/router';
import { ReceiptComponent } from './receipt.component';

export const receiptRoutes: Routes = [
  {
    path: '',
    component: ReceiptComponent,
    children: []
  }
];
