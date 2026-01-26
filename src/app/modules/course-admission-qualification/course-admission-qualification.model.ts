import dayjs from 'dayjs/esm';




export interface ICourseAdmissionQualification {
  id?: number;
  
  
  subjectName?: String | null;
  
  
  grade?: String | null;
  
  
  year?: number | null;
  
  
  level?: String | null;
  
  
}

export type NewCourseAdmissionQualification = Omit<ICourseAdmissionQualification, 'id'> & { id: null };
