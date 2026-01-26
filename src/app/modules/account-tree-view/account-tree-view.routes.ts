import { Routes } from '@angular/router';
import { AccounttreeViewComponent } from './accounttree-view.component';

export const AccountTreeViewRoutes: Routes = [
  {
    path: '',
    component: AccounttreeViewComponent,
    children: []
  }
];