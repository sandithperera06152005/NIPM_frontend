import dayjs from 'dayjs/esm';

export interface IInstallment {
  installmentNo: number;
  installmentFee: number;
  dueDate?: string | null;
}


export interface ICourse {
  id?: number;
  
  
  code?: String | null;
  
  
  title?: String | null;
  

  coordinator?: { id: number } | null;
  
  
  fee?: number | null;
  
  
  durationMonths?: number | null;

  noofInstallments: number;

  
  active?: boolean | null;

 
  courseInstallments?:IInstallment[];
}

export type NewCourse = Omit<ICourse, 'id'> & { id: null };
