import dayjs from 'dayjs/esm';




export interface IMembershipType {
  id?: number;
  
  
  name?: String | null;
  
  
  fee?: number | null;
  
  
  validityMonths?: number | null;
  
  
}

export type NewMembershipType = Omit<IMembershipType, 'id'> & { id: null };
