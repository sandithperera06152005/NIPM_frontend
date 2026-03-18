import dayjs from 'dayjs/esm';
import { IMembershipAdmission } from 'app/modules/membership-admission/membership-admission.model';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { PaymentMethod } from 'app/enums/payment-method.model';
import { PaymentStatus } from 'app/enums/payment-status.model';

export interface IPayment {
  id: number;
  memberID?: number | null;
  paymentMethod?: keyof typeof PaymentMethod | null;
  amount?: number | null;
  referenceNumber?: string | null;
  paymentDate?: dayjs.Dayjs | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  membershipAdmission?: Pick<IMembershipAdmission, 'id'> | null;
  applicant?: Pick<IApplicant, 'id'> | null;
  invoiceId?: number | null;
}

export type NewPayment = Omit<IPayment, 'id'> & { id: null };
