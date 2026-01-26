import dayjs from 'dayjs/esm';

import { IReceipt, NewReceipt } from './receipt.model';

export const sampleWithRequiredData: IReceipt = {
  id: 15334,
};

export const sampleWithPartialData: IReceipt = {
  id: 7628,
  customerAddress: 'anti',
  totalAmountInWord: 'scornful cafe though',
  comments: 'and',
  lmd: dayjs('2025-09-01T13:01'),
  termId: 10411,
  date: dayjs('2025-09-01T23:36'),
  amount: 25776.27,
  bank: 'shore jazz',
  isActive: false,
  deposited: false,
  createdBy: 21650,
};

export const sampleWithFullData: IReceipt = {
  id: 11610,
  code: 'attribute furthermore',
  receiptDate: dayjs('2025-09-01T16:04'),
  customerName: 'promptly sizzle',
  customerAddress: 'minister plus',
  totalAmount: 24647.68,
  totalAmountInWord: 'excluding gosh',
  comments: 'ick colorfully yin',
  lmu: 23718,
  lmd: dayjs('2025-09-01T11:26'),
  termId: 11442,
  term: 'when',
  date: dayjs('2025-09-02T06:19'),
  amount: 16035.96,
  checkDate: dayjs('2025-09-02T05:55'),
  checkNo: 'if violently',
  bank: 'chubby sick',
  customerId: 26874,
  isActive: false,
  deposited: false,
  createdBy: 573,
};

export const sampleWithNewData: NewReceipt = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
