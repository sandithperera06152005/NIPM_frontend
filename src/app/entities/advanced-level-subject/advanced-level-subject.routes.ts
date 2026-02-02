import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AdvancedLevelSubjectResolve from './route/advanced-level-subject-routing-resolve.service';

const advancedLevelSubjectRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/advanced-level-subject.component').then(m => m.AdvancedLevelSubjectComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/advanced-level-subject-detail.component').then(m => m.AdvancedLevelSubjectDetailComponent),
    resolve: {
      advancedLevelSubject: AdvancedLevelSubjectResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/advanced-level-subject-update.component').then(m => m.AdvancedLevelSubjectUpdateComponent),
    resolve: {
      advancedLevelSubject: AdvancedLevelSubjectResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/advanced-level-subject-update.component').then(m => m.AdvancedLevelSubjectUpdateComponent),
    resolve: {
      advancedLevelSubject: AdvancedLevelSubjectResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default advancedLevelSubjectRoute;
