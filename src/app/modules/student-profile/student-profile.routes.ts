import { Routes } from '@angular/router';
import { StudentProfileListComponent } from './list/student-profile-list.component';
import { StudentProfileViewComponent } from './student-profile-view.component';

export default [
  {
    path: '',
    component: StudentProfileListComponent,
  },
  {
    path: 'view',
    component: StudentProfileViewComponent,
  },

] as Routes;
