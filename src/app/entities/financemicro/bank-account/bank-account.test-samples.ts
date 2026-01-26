import dayjs from 'dayjs/esm';

import { IBankAccount, NewBankAccount } from './bank-account.model';

export const sampleWithRequiredData: IBankAccount = {
  id: 17167,
};

export const sampleWithPartialData: IBankAccount = {
  id: 19630,
  accountName: 'Personal Loan Account',
  bankName: 'forenenst',
  branchName: 'save',
  accountCode: 'reckon scornful think',
  lmu: 'sham provided spirit',
  isActive: true,
  accountTypeId: 18966,
};

export const sampleWithFullData: IBankAccount = {
  id: 13483,
  companyId: 'gigantic',
  accountNumber: 'fairly fooey ugh',
  accountName: 'Auto Loan Account',
  bankName: 'rust punctually',
  bankId: 18317,
  branchName: 'guest',
  branchId: 5580,
  amount: 29820,
  accountCode: 'at dredger',
  accountId: 5177,
  lmd: dayjs('2025-11-30T09:11'),
  lmu: 'midst patiently',
  isActive: true,
  accountTypeId: 16136,
};

export const sampleWithNewData: NewBankAccount = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
