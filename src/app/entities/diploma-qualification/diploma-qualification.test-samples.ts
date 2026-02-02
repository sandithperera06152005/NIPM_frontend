import dayjs from 'dayjs/esm';

import { IDiplomaQualification, NewDiplomaQualification } from './diploma-qualification.model';

export const sampleWithRequiredData: IDiplomaQualification = {
  id: 21254,
};

export const sampleWithPartialData: IDiplomaQualification = {
  id: 7316,
  diplomaProgramName: 'contrast impact thorny',
  effectiveDate: dayjs('2026-02-01'),
  certificateRefNumber: 'capsize out fiercely',
};

export const sampleWithFullData: IDiplomaQualification = {
  id: 1251,
  qualificationType: 'NVQ6',
  diplomaProgramName: 'taut',
  discipline: 'bah hutch',
  instituteName: 'conservative',
  effectiveDate: dayjs('2026-02-01'),
  certificateRefNumber: 'deep diligently who',
};

export const sampleWithNewData: NewDiplomaQualification = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
