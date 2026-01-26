import dayjs from 'dayjs/esm';




export interface IAdvertisementType {
  id?: number;
  
  
  name?: String | null;
  
  
}

export type NewAdvertisementType = Omit<IAdvertisementType, 'id'> & { id: null };
