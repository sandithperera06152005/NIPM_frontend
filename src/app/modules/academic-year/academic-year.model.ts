import dayjs from 'dayjs/esm';




export interface IAcademicYear {
  id?: number;
  
  
  yearLabel?: String | null;
  
  
  startDate?: dayjs.Dayjs | null;
  
  
  endDate?: dayjs.Dayjs | null;
  
  
}

export type NewAcademicYear = Omit<IAcademicYear, 'id'> & { id: null };
