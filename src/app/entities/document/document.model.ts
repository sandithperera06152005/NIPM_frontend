import { IPayment } from 'app/entities/payment/payment.model';
import { DocumentType } from 'app/enums/document-type.model';

export interface IDocument {
  id: number;
  fileName?: string | null;
  fileUrl?: string | null;
  documentType?: keyof typeof DocumentType | null;
  payment?: Pick<IPayment, 'id'> | null;
}

export type NewDocument = Omit<IDocument, 'id'> & { id: null };
