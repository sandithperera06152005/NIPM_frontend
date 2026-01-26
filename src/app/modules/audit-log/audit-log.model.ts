import dayjs from 'dayjs/esm';




export interface IAuditLog {
  id?: number;
  
  
  action?: String | null;
  
  
  entityName?: String | null;
  
  
  entityId?: number | null;
  
  
  performedAt?: dayjs.Dayjs | null;
  
  
  ipAddress?: String | null;
  
  
}

export type NewAuditLog = Omit<IAuditLog, 'id'> & { id: null };
