import dayjs from 'dayjs/esm';
import { IEmployment } from 'app/entities/employment/employment.model';
import { Gender } from 'app/entities/enumerations/gender.model';
import { CourseType } from 'app/entities/enumerations/course-type.model';
import { FinanceType } from 'app/entities/enumerations/finance-type.model';

export interface IApplicant {
  id: number;
  fullName?: string | null;
  initialsName?: string | null;
  dateOfBirth?: dayjs.Dayjs | null;
  gender?: keyof typeof Gender | null;
  nationality?: string | null;
  nicNumber?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  whatsappNumber?: string | null;
  contactAddress?: string | null;
  permanentAddress?: string | null;
  district?: string | null;
  preferredCourseType?: keyof typeof CourseType | null;
  financeType?: keyof typeof FinanceType | null;
  sponsorName?: string | null;
  declarationAccepted?: boolean | null;
  employment?: Pick<IEmployment, 'id'> | null;
}

export type NewApplicant = Omit<IApplicant, 'id'> & { id: null };
