import { IDocument } from 'app/entities/document/document.model';
import dayjs from 'dayjs/esm';




export interface ICourseAdmission {
  id: number;
  fullName: string;
  nameWithInitials: string;
  permanentAddress: string;
  teleNo: string;
  mobileNo: string;
  whatsAppNo: string;
  email: string;
  nic: string;
  dateOfBirth: string; // or Dayjs
  employer: string;
  employerDesignation: string;
  employerOfficialAddress: string;
  employerTeleNo: string;
  employerFaxNo: string;
  sponsorByWhom: string;
  advertisementTypeOther: string;
  status: string;
  appliedDateTime: string; // or Dayjs
  approval1Status: boolean;
  approval1DateTime: string;
  approval2Status: boolean;
  approval2DateTime: string;
  approval3Status: boolean;
  approval3DateTime: string;
  isSinglePayment: boolean;
}

export interface IInvoice {
  id?: number;
  invoiceNo?: string | null;
  issuedDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  totalAmount?: number | null;
  paidAmount?: number | null;
  courseAdmission?: ICourseAdmission; 
  documents?: IDocument[];
  registrationNumber?: string | null;
}

export type NewInvoice = Omit<IInvoice, 'id'> & { id: null };
