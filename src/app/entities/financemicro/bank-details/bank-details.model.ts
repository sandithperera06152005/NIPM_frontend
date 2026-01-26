import dayjs from 'dayjs/esm';

export interface IBankDetails {
  id: number;
  companyId?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  bankName?: string | null;
  bankId?: number | null;
  branchName?: string | null;
  branchId?: number | null;
  amount?: number | null;
  accountCode?: string | null;
  accountId?: number | null;
  lmd?: dayjs.Dayjs | null;
  lmu?: string | null;
  isActive?: boolean | null;
  accountTypeId?: number | null;
}

export type NewBankDetails = Omit<IBankDetails, 'id'> & { id: null };
