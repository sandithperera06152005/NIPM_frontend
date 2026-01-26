import dayjs from 'dayjs/esm';

import { IVoucher, NewVoucher } from './voucher.model';

export const sampleWithRequiredData: IVoucher = {
  id: 26517,
};

export const sampleWithPartialData: IVoucher = {
  id: 30062,
  code: 'factorise regarding',
  totalAmount: 5566.29,
  totalAmountInWord: 'until',
  lmu: 20166,
  lmd: dayjs('2025-10-20T09:00'),
  term: 'educated midst doing',
  date: dayjs('2025-10-21T04:44'),
  amount: 5857.11,
  checkNo: 'hovercraft absent',
  depBank: 'undergo unless',
  customerId: 7241,
  isActive: true,
  amountNo: 3611,
  depAmount: 23866,
};

export const sampleWithFullData: IVoucher = {
  id: 19024,
  code: 'promise dress',
  receiptDate: dayjs('2025-10-20T16:21'),
  customerName: 'converse unruly enchanted',
  customerAddress: 'although usefully before',
  totalAmount: 11270.3,
  totalAmountInWord: 'duh',
  comments: 'provided requirement',
  lmu: 11155,
  lmd: dayjs('2025-10-20T09:39'),
  termId: 25024,
  term: 'monthly',
  date: dayjs('2025-10-20T23:27'),
  amount: 26775.6,
  checkDate: dayjs('2025-10-20T22:43'),
  checkNo: 'aw so powerfully',
  bank: 'um switch trust',
  depBank: 'government or',
  bankId: 24568,
  branch: 'confide',
  customerId: 1187,
  isActive: false,
  deposited: true,
  createdBy: 4936,
  amountNo: 24141,
  refNo: 'shameful ouch',
  depAmount: 5236,
};

export const sampleWithNewData: NewVoucher = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
