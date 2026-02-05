import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AchievementResolve from './route/achievement-routing-resolve.service';

const achievementRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/achievement.component').then(m => m.AchievementComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/achievement-detail.component').then(m => m.AchievementDetailComponent),
    resolve: {
      achievement: AchievementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/achievement-update.component').then(m => m.AchievementUpdateComponent),
    resolve: {
      achievement: AchievementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/achievement-update.component').then(m => m.AchievementUpdateComponent),
    resolve: {
      achievement: AchievementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default achievementRoute;
