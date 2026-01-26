import dayjs from 'dayjs/esm';

import { ICustomerPayments, NewCustomerPayments } from './customer-payments.model';

export const sampleWithRequiredData: ICustomerPayments = {
  id: 20824,
};

export const sampleWithPartialData: ICustomerPayments = {
  id: 28173,
  address: 'emulsify',
  email: 'Uriah_Gusikowski78@gmail.com',
  contactNo: 17639,
  invoiceCode: 'briskly gah mmm',
  subTotal: 23039,
  discount: 3081,
  serialNo: 26294,
  description: 'desecrate antelope',
  accountInv: 'reasoning apropos um',
};

export const sampleWithFullData: ICustomerPayments = {
  id: 28914,
  opsUnitID: 'questionably blah foolishly',
  paymentId: 20776,
  paymentCode: 'amidst',
  date: dayjs('2025-09-30T20:05'),
  address: 'down',
  email: 'Ethel.Greenfelder-Sipes@gmail.com',
  contactNo: 22715,
  invoiceCode: 'eek pause',
  subTotal: 27371,
  owing: 22895,
  discount: 9401,
  serialNo: 18680,
  description: 'bah',
  accountInv: 'drat whoever',
  lmu: 'whether confiscate fencing',
  lmd: dayjs('2025-10-01T09:58'),
};

export const sampleWithNewData: NewCustomerPayments = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
