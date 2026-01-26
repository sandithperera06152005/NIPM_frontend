import dayjs from 'dayjs/esm';

import { ApplicationStatus } from '../../enums/application-status.model';


export interface ICourseAdmission {
  id?: number;
  
  
  fullName?: String | null;
  
  
  nameWithInitials?: String | null;
  
  
  permanentAddress?: String | null;
  
  
  teleNo?: String | null;
  
  
  mobileNo?: String | null;
  
  
  whatsAppNo?: String | null;
  
  
  email?: String | null;
  
  
  nic?: String | null;
  
  
  dateOfBirth?: dayjs.Dayjs | null;
  
  
  employer?: String | null;
  
  
  employerDesignation?: String | null;
  
  
  employerOfficialAddress?: String | null;
  
  
  employerTeleNo?: String | null;
  
  
  employerFaxNo?: String | null;
  
  
  sponsorByWhom?: String | null;
  
  
  advertisementTypeOther?: String | null;
  
  
  status?: ApplicationStatus | null;
  
  
  appliedDateTime?: dayjs.Dayjs | null;
  
  
  approval1Status?: boolean | null;
  
  
  approval1DateTime?: dayjs.Dayjs | null;
  
  
  approval2Status?: boolean | null;
  
  
  approval2DateTime?: dayjs.Dayjs | null;
  
  
  approval3Status?: boolean | null;
  
  
  approval3DateTime?: dayjs.Dayjs | null;
  
  
}

export type NewCourseAdmission = Omit<ICourseAdmission, 'id'> & { id: null };
