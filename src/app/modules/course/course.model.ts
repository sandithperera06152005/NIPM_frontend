import dayjs from 'dayjs/esm';




export interface ICourse {
  id?: number;
  
  
  code?: String | null;
  
  
  title?: String | null;
  
  
  fee?: number | null;
  
  
  durationMonths?: number | null;
  
  
  active?: boolean | null;
  
  
}

export type NewCourse = Omit<ICourse, 'id'> & { id: null };
