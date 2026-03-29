import { Routes } from '@angular/router';
import { CourseListComponent } from './list/course-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: CourseListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_COURSE_ADMIN'] }
  },

] as Routes;
