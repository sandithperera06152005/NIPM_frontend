import { IAdvancedLevelQualification } from 'app/entities/advanced-level-qualification/advanced-level-qualification.model';

export interface IAdvancedLevelSubject {
  id: number;
  subjectName?: string | null;
  grade?: string | null;
  advancedLevelQualification?: Pick<IAdvancedLevelQualification, 'id'> | null;
}

export type NewAdvancedLevelSubject = Omit<IAdvancedLevelSubject, 'id'> & { id: null };
