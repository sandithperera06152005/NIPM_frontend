import dayjs from 'dayjs/esm';

export interface IInstallment {
  installmentNo: number;
  installmentFee: number;
}


export interface ICourse {
  id?: number;
  
  
  code?: String | null;
  
  
  title?: String | null;
  
  
  fee?: number | null;
  
  
  durationMonths?: number | null;

  noofInstallments: number;

  
  active?: boolean | null;
  
  
  courseInstallments?: { installmentNo: number; installmentFee: number }[];
}

export type NewCourse = Omit<ICourse, 'id'> & { id: null };
