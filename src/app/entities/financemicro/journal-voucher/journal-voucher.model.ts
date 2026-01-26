import dayjs from 'dayjs/esm';

export interface IJournalVoucher {
  id: number;
  code?: string | null;
  date?: dayjs.Dayjs | null;
  debitTotal?: number | null;
  creditTotal?: number | null;
  comments?: string | null;
  value?: number | null;
  serialNo?: number | null;
}

export type NewJournalVoucher = Omit<IJournalVoucher, 'id'> & { id: null };
