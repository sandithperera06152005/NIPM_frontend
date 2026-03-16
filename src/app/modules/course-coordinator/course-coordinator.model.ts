import dayjs from 'dayjs/esm';




export interface ICourseCoordinator {
  id?: number;
  
  
  fullName?: String | null;
  
  
  teleNo?: String | null;
  
  
  email?: String | null;
  
  
  nic?: String | null;
  
  
  isActive?: boolean | null;
  
  
}

export type NewCourseCoordinator = Omit<ICourseCoordinator, 'id'> & { id: null };
