import dayjs from 'dayjs/esm';
import { IAccountType } from '../account-type/account-type.model';

export interface IVoucher {
  id: number;
  code?: string | null;
  receiptDate?: dayjs.Dayjs | null;
  customerName?: string | null;
  customerAddress?: string | null;
  totalAmount?: number | null;
  totalAmountInWord?: string | null;
  comments?: string | null;
  lmu?: number | null;
  lmd?: dayjs.Dayjs | null;
  termId?: number | null;
  term?: string | null;
  date?: dayjs.Dayjs | null;
  amount?: number | null;
  checkDate?: dayjs.Dayjs | null;
  checkNo?: string | null;
  bank?: string | null;
  depBank?: string | null;
  bankId?: number | null;
  branch?: string | null;
  customerId?: number | null;
  isActive?: boolean | null;
  deposited?: boolean | null;
  createdBy?: number | null;
  amountNo?: number | null;
  refNo?: string | null;
  depAmount?: number | null;

  subAccount?: IAccountType | null;
  parentAccount?: IAccountType | null;
  lineDescription?: string | null;
}

export type NewVoucher = Omit<IVoucher, 'id'> & { id: null };
