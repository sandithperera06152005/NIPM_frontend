import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AdvancedLevelQualificationResolve from './route/advanced-level-qualification-routing-resolve.service';

const advancedLevelQualificationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/advanced-level-qualification.component').then(m => m.AdvancedLevelQualificationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/advanced-level-qualification-detail.component').then(m => m.AdvancedLevelQualificationDetailComponent),
    resolve: {
      advancedLevelQualification: AdvancedLevelQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/advanced-level-qualification-update.component').then(m => m.AdvancedLevelQualificationUpdateComponent),
    resolve: {
      advancedLevelQualification: AdvancedLevelQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/advanced-level-qualification-update.component').then(m => m.AdvancedLevelQualificationUpdateComponent),
    resolve: {
      advancedLevelQualification: AdvancedLevelQualificationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default advancedLevelQualificationRoute;
