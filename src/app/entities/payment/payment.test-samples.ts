import dayjs from 'dayjs/esm';

import { IPayment, NewPayment } from './payment.model';

export const sampleWithRequiredData: IPayment = {
  id: 4942,
};

export const sampleWithPartialData: IPayment = {
  id: 27804,
  amount: 26156.82,
  paymentStatus: 'FAILED',
};

export const sampleWithFullData: IPayment = {
  id: 28239,
  paymentMethod: 'BANK_TRANSFER',
  amount: 14590.51,
  referenceNumber: 'ouch out',
  paymentDate: dayjs('2026-01-22'),
  paymentStatus: 'FAILED',
};

export const sampleWithNewData: NewPayment = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
