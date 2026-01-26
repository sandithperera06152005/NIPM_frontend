import dayjs from 'dayjs/esm';




export interface ICompany {
  id?: number;
  
  
  companyName?: String | null;
  
  
  registrationNo?: String | null;
  
  
  contactEmail?: String | null;
  
  
  contactPhone?: String | null;
  
  
  address?: String | null;
  
  
  status?: String | null;
  
  
  createdAt?: dayjs.Dayjs | null;
  
  
}

export type NewCompany = Omit<ICompany, 'id'> & { id: null };
