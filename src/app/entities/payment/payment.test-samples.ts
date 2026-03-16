import dayjs from 'dayjs/esm';

import { IPayment, NewPayment } from './payment.model';

export const sampleWithRequiredData: IPayment = {
  id: 4942,
};

export const sampleWithPartialData: IPayment = {
  id: 26157,
  paymentMethod: 'ONLINE',
  paymentDate: dayjs('2026-01-22'),
};

export const sampleWithFullData: IPayment = {
  id: 28239,
  memberID: 11240,
  paymentMethod: 'BANK_TRANSFER',
  amount: 12086.74,
  referenceNumber: 'refute what pupil',
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
