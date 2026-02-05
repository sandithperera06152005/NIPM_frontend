import { IApplicant } from 'app/entities/applicant/applicant.model';

export interface IAdvancedLevelQualification {
  id: number;
  examYear?: number | null;
  indexNumber?: string | null;
  stream?: string | null;
  medium?: string | null;
  zScore?: number | null;
  applicant?: Pick<IApplicant, 'id'> | null;
}

export type NewAdvancedLevelQualification = Omit<IAdvancedLevelQualification, 'id'> & { id: null };
