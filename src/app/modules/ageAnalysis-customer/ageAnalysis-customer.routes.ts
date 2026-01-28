import { Routes } from '@angular/router';
import { AgeAnalysisCustomerComponent } from './ageAnalysis-customer.component';

export const AgeAnalysisCustomerRoutes: Routes = [
  {
    path: '',
    component: AgeAnalysisCustomerComponent,
    children: []
  }
];