import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import IndustryExperienceResolve from './route/industry-experience-routing-resolve.service';

const industryExperienceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/industry-experience.component').then(m => m.IndustryExperienceComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/industry-experience-detail.component').then(m => m.IndustryExperienceDetailComponent),
    resolve: {
      industryExperience: IndustryExperienceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/industry-experience-update.component').then(m => m.IndustryExperienceUpdateComponent),
    resolve: {
      industryExperience: IndustryExperienceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/industry-experience-update.component').then(m => m.IndustryExperienceUpdateComponent),
    resolve: {
      industryExperience: IndustryExperienceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default industryExperienceRoute;
