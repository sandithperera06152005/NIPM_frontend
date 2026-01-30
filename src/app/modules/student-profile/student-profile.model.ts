import dayjs from 'dayjs/esm';

import { EnrollmentStatus } from 'app/enums/enrollment-status.model';


export interface IStudentProfile {
  id?: number;
  
  
  studentNumber?: String | null;

  
  studentName?: String | null;

  
  nic?: String | null;
  
  
  dateOfBirth?: dayjs.Dayjs | null;
  
  
  address?: String | null;
  
  
  enrollmentStatus?: EnrollmentStatus | null;
  
  
  createdAt?: dayjs.Dayjs | null;
  
  
}

export type NewStudentProfile = Omit<IStudentProfile, 'id'> & { id: null };
