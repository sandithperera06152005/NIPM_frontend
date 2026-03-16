import dayjs from 'dayjs/esm';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { PaymentMethod } from 'app/enums/payment-method.model';
import { PaymentStatus } from 'app/enums/payment-status.model';

export interface IPayment {
  id: number;
  paymentMethod?: keyof typeof PaymentMethod | null;
  amount?: number | null;
  referenceNumber?: string | null;
  paymentDate?: dayjs.Dayjs | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  applicant?: Pick<IApplicant, 'id'> | null;
  invoiceId?: number | null;
}

export type NewPayment = Omit<IPayment, 'id'> & { id: null };
