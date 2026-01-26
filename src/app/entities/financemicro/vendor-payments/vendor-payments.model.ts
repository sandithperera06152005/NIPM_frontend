import dayjs from 'dayjs/esm';

export interface IVendorPayments {
  id: number;
  opsUnitID?: string | null;
  paymentId?: number | null;
  paymentCode?: string | null;
  date?: dayjs.Dayjs | null;
  address?: string | null;
  email?: string | null;
  contactNo?: number | null;
  grnCode?: string | null;
  subTotal?: number | null;
  owing?: number | null;
  discount?: number | null;
  serialNo?: number | null;
  description?: string | null;
  accountInv?: string | null;
  lmu?: string | null;
  lmd?: dayjs.Dayjs | null;
  amount?: number | null;
}

export type NewVendorPayments = Omit<IVendorPayments, 'id'> & { id: null };
