import dayjs from 'dayjs/esm';
import { IApplicant } from 'app/entities/applicant/applicant.model';

export interface IIndustryExperience {
  id: number;
  instituteName?: string | null;
  fromDate?: dayjs.Dayjs | null;
  toDate?: dayjs.Dayjs | null;
  years?: number | null;
  months?: number | null;
  applicant?: Pick<IApplicant, 'id'> | null;
}

export type NewIndustryExperience = Omit<IIndustryExperience, 'id'> & { id: null };
