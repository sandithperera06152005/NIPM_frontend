import dayjs from 'dayjs/esm';

import { ApplicationStatus } from '../../enums/application-status.model';


export interface IMembershipApplication {
  id?: number;
  
  
  applicationDate?: dayjs.Dayjs | null;
  
  
  status?: ApplicationStatus | null;
  
  
}

export type NewMembershipApplication = Omit<IMembershipApplication, 'id'> & { id: null };
