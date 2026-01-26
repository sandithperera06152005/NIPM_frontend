import dayjs from 'dayjs/esm';

export interface IChequeRegistry {
  id: number;
  receiptCode?: string | null;
  customerName?: string | null;
  bankName?: string | null;
  chequeNo?: string | null;
  amount?: number | null;
  chequeDate?: dayjs.Dayjs | null;
  depositedDate?: dayjs.Dayjs | null;
  bankAccount?: string | null;
  status?: string | null;
  isChanged?: boolean | null;
  chrFrmCus?: boolean | null;
  returnFee?: number | null;
  lmd?: dayjs.Dayjs | null;
  lmu?: string | null;

 // paymentMethod?: string;
}

export type NewChequeRegistry = Omit<IChequeRegistry, 'id'> & { id: null };
