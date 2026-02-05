import dayjs from 'dayjs/esm';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { NVQType } from 'app/entities/enumerations/nvq-type.model';

export interface IDiplomaQualification {
  id: number;
  qualificationType?: keyof typeof NVQType | null;
  diplomaProgramName?: string | null;
  discipline?: string | null;
  instituteName?: string | null;
  effectiveDate?: dayjs.Dayjs | null;
  certificateRefNumber?: string | null;
  applicant?: Pick<IApplicant, 'id'> | null;
}

export type NewDiplomaQualification = Omit<IDiplomaQualification, 'id'> & { id: null };
