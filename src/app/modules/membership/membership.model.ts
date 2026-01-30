import dayjs from 'dayjs/esm';

import { MembershipStatus } from 'app/enums/membership-status.model';


export interface IMembership {
  id?: number;


  membershipNumber?: String | null;


  startDate?: dayjs.Dayjs | null;


  endDate?: dayjs.Dayjs | null;


  status?: MembershipStatus | null;


}

export type NewMembership = Omit<IMembership, 'id'> & { id: null };
