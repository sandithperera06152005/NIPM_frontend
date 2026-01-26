import dayjs from 'dayjs/esm';

import { IBankDetails, NewBankDetails } from './bank-details.model';

export const sampleWithRequiredData: IBankDetails = {
  id: 29150,
};

export const sampleWithPartialData: IBankDetails = {
  id: 9593,
  companyId: 'kowtow excess',
  accountNumber: 'well-off gee',
  accountName: 'Credit Card Account',
  bankName: 'etch any although',
  bankId: 11410,
  branchName: 'meanwhile cafe',
  branchId: 10172,
  amount: 28511,
  accountCode: 'safe lovingly blah',
  accountTypeId: 24528,
};

export const sampleWithFullData: IBankDetails = {
  id: 17118,
  companyId: 'rule',
  accountNumber: 'accompanist',
  accountName: 'Credit Card Account',
  bankName: 'inasmuch enhance offset',
  bankId: 15964,
  branchName: 'but finally',
  branchId: 11836,
  amount: 2512,
  accountCode: 'bare',
  accountId: 12492,
  lmd: dayjs('2025-09-23T05:29'),
  lmu: 'longingly huddle',
  isActive: true,
  accountTypeId: 370,
};

export const sampleWithNewData: NewBankDetails = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
