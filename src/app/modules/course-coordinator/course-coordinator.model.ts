import dayjs from 'dayjs/esm';




export interface ICourseCoordinator {
  id?: number;

  fullName?: string | null;

  teleNo?: string | null;

  email?: string | null;

  nic?: string | null;

  isActive?: boolean | null;
  
  
}

export type NewCourseCoordinator = Omit<ICourseCoordinator, 'id'> & { id: null };
