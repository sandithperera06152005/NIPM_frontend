import { IApplicant } from 'app/entities/applicant/applicant.model';

export interface IEmployment {
  id: number;
  organizationName?: string | null;
  designation?: string | null;
  officialTelephone?: string | null;
  officialAddress?: string | null;
  applicant?: Pick<IApplicant, 'id'> | null;
}

export type NewEmployment = Omit<IEmployment, 'id'> & { id: null };
