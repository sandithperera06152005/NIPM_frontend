import dayjs from 'dayjs/esm';

import { UserStatus } from 'app/enums/user-status.model';


export interface IAppUser {
  id?: number;
  
  
  username?: String | null;
  
  
  email?: String | null;
  
  
  passwordHash?: String | null;
  
  
  firstName?: String | null;
  
  
  lastName?: String | null;
  
  
  phone?: String | null;
  
  
  status?: UserStatus | null;
  
  
  createdAt?: dayjs.Dayjs | null;
  
  
  updatedAt?: dayjs.Dayjs | null;
  
  
  lastLoginAt?: dayjs.Dayjs | null;
  
  
}

export type NewAppUser = Omit<IAppUser, 'id'> & { id: null };
