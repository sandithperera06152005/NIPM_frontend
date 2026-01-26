import dayjs from 'dayjs/esm';




export interface ICompanyParticipant {
  id?: number;
  
  
  joinedAt?: dayjs.Dayjs | null;
  
  
}

export type NewCompanyParticipant = Omit<ICompanyParticipant, 'id'> & { id: null };
