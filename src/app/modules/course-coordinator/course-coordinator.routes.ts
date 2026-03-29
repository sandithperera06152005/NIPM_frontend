import { Routes } from '@angular/router';
import { CourseCoordinatorListComponent } from './list/course-coordinator-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: CourseCoordinatorListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_COURSE_ADMIN'] }
  },

] as Routes;
