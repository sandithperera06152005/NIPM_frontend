import dayjs from 'dayjs/esm';

import { IVendorPayments, NewVendorPayments } from './vendor-payments.model';

export const sampleWithRequiredData: IVendorPayments = {
  id: 12166,
};

export const sampleWithPartialData: IVendorPayments = {
  id: 18155,
  date: dayjs('2025-10-26T03:43'),
  address: 'however',
  contactNo: 5495,
  discount: 18247,
  serialNo: 2361,
  description: 'amongst ugh',
  lmu: 'indolent',
  lmd: dayjs('2025-10-26T13:43'),
  amount: 23287,
};

export const sampleWithFullData: IVendorPayments = {
  id: 18587,
  opsUnitID: 'mmm chip',
  paymentId: 2954,
  paymentCode: 'lanky',
  date: dayjs('2025-10-26T06:41'),
  address: 'inasmuch',
  email: 'Kennedy58@hotmail.com',
  contactNo: 16055,
  grnCode: 'drat',
  subTotal: 30044,
  owing: 29310,
  discount: 12012,
  serialNo: 14296,
  description: 'claw cantaloupe',
  accountInv: 'lawmaker equally outside',
  lmu: 'waltz',
  lmd: dayjs('2025-10-25T23:47'),
  amount: 24797,
};

export const sampleWithNewData: NewVendorPayments = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
