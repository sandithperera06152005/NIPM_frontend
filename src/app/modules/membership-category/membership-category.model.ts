import dayjs from 'dayjs/esm';

import { MembershipStatus } from '../../enums/membership-status.model';


export interface IMembershipCategory {
  id?: number;


  membershipNumber?: string | null;


  membershipName?: string | null;


  startDate?: dayjs.Dayjs | null;


  endDate?: dayjs.Dayjs | null;


  duration?: number | null;


  price?: number | null;


  status?: MembershipStatus | null;


}

export type NewMembershipCategory = Omit<IMembershipCategory, 'id'> & { id: null };
