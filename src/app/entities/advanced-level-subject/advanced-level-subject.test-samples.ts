import { IAdvancedLevelSubject, NewAdvancedLevelSubject } from './advanced-level-subject.model';

export const sampleWithRequiredData: IAdvancedLevelSubject = {
  id: 18238,
};

export const sampleWithPartialData: IAdvancedLevelSubject = {
  id: 16636,
  subjectName: 'oof',
};

export const sampleWithFullData: IAdvancedLevelSubject = {
  id: 5104,
  subjectName: 'ick bookend now',
  grade: 'before wonderfully',
};

export const sampleWithNewData: NewAdvancedLevelSubject = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
