import { Routes } from '@angular/router';
import { ChequeRegistryComponent } from './cheque-registry.component';

export const ChequeRegistryRoutes: Routes = [
    {
        path: '',
        component: ChequeRegistryComponent,
        children: []
    }
];