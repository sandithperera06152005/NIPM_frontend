import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import DiplomaQualificationResolve from './route/diploma-qualification-routing-resolve.service';

const diplomaQualificationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/diploma-qualification.component').then(m => m.DiplomaQualificationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/diploma-qualification-detail.component').then(m => m.DiplomaQualificationDetailComponent),
    resolve: {
      diplomaQualification: DiplomaQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/diploma-qualification-update.component').then(m => m.DiplomaQualificationUpdateComponent),
    resolve: {
      diplomaQualification: DiplomaQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/diploma-qualification-update.component').then(m => m.DiplomaQualificationUpdateComponent),
    resolve: {
      diplomaQualification: DiplomaQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default diplomaQualificationRoute;
