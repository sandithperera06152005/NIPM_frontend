import dayjs from 'dayjs/esm';

import { ApplicationStatus } from '../../enums/application-status.model';


export interface ICourseApplication {
  id?: number;
  
  
  applicationDate?: dayjs.Dayjs | null;
  
  
  status?: ApplicationStatus | null;
  
  
  remarks?: String | null;
  
  
}

export type NewCourseApplication = Omit<ICourseApplication, 'id'> & { id: null };
