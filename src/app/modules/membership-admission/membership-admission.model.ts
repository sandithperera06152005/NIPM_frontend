import dayjs from 'dayjs/esm';

import { ApplicationStatus } from '../../enums/application-status.model';


export interface IMembershipAdmission {
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
  
  
  memberOfCIP?: boolean | null;
  
  
  unsoundMind?: boolean | null;
  
  
  insolventOrBankrupt?: boolean | null;
  
  
  convictedByCourt?: boolean | null;
  
  
  referees1Name?: String | null;
  
  
  referees1Designation?: String | null;
  
  
  referees1Address?: String | null;
  
  
  referees2Name?: String | null;
  
  
  referees2Designation?: String | null;
  
  
  referees2Address?: String | null;
  
  
  status?: ApplicationStatus | null;
  
  
  appliedDateTime?: dayjs.Dayjs | null;
  
  
}

export type NewMembershipAdmission = Omit<IMembershipAdmission, 'id'> & { id: null };
