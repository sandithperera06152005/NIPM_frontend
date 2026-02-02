import { IApplicant } from 'app/entities/applicant/applicant.model';

export interface IAchievement {
  id: number;
  description?: string | null;
  applicant?: Pick<IApplicant, 'id'> | null;
}

export type NewAchievement = Omit<IAchievement, 'id'> & { id: null };
