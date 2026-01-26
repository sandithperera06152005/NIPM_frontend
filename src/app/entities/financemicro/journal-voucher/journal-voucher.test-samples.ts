import dayjs from 'dayjs/esm';

import { IJournalVoucher, NewJournalVoucher } from './journal-voucher.model';

export const sampleWithRequiredData: IJournalVoucher = {
  id: 6718,
};

export const sampleWithPartialData: IJournalVoucher = {
  id: 25263,
  date: dayjs('2025-12-08T05:07'),
  debitTotal: 7695,
  comments: 'whoever lest',
  value: 17470,
};

export const sampleWithFullData: IJournalVoucher = {
  id: 16361,
  code: 'drug alliance',
  date: dayjs('2025-12-07T17:59'),
  debitTotal: 14477,
  creditTotal: 9690,
  comments: 'sheathe winding boo',
  value: 25233,
  serialNo: 23581,
};

export const sampleWithNewData: NewJournalVoucher = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
