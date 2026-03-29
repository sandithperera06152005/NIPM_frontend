import { Routes } from '@angular/router';
import { CourseAdmissionListComponent } from './list/course-admission-list.component';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

export default [
  {
    path: '',
    component: CourseAdmissionListComponent,
    canActivate: [UserRouteAccessService],
    data: { authorities: ['ROLE_ADMIN', 'ROLE_STUDENT_COORDINATOR'] }
  },

] as Routes;
