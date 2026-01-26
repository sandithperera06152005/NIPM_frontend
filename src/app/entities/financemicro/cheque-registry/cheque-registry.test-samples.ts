import dayjs from 'dayjs/esm';

import { IChequeRegistry, NewChequeRegistry } from './cheque-registry.model';

export const sampleWithRequiredData: IChequeRegistry = {
  id: 18027,
  receiptCode: 'ick',
};

export const sampleWithPartialData: IChequeRegistry = {
  id: 13118,
  receiptCode: 'whack',
  customerName: 'boo nor',
  chequeNo: 'annually e-mail joyfully',
  depositedDate: dayjs('2026-01-18T23:32'),
  bankAccount: 'incidentally heroine inculcate',
  status: 'oh immediately wearily',
  isChanged: false,
  returnFee: 30123.73,
  lmu: 'plump finally including',
};

export const sampleWithFullData: IChequeRegistry = {
  id: 29782,
  receiptCode: 'oh subsidy',
  customerName: 'swath sunbathe collaboration',
  bankName: 'frantically justly',
  chequeNo: 'woefully pfft',
  amount: 20140.04,
  chequeDate: dayjs('2026-01-18T23:26'),
  depositedDate: dayjs('2026-01-18T09:17'),
  bankAccount: 'shoot cinder',
  status: 'rise downshift',
  isChanged: false,
  chrFrmCus: false,
  returnFee: 10880.59,
  lmd: dayjs('2026-01-19T04:45'),
  lmu: 'even some',
};

export const sampleWithNewData: NewChequeRegistry = {
  receiptCode: 'wholly',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
