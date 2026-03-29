import { Routes } from '@angular/router';
import { CourseRegFormListComponent } from './list/course-reg-form-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: CourseRegFormListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_COURSE_ADMIN'] }
  },

] as Routes;
