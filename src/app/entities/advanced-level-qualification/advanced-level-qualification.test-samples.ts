import { IAdvancedLevelQualification, NewAdvancedLevelQualification } from './advanced-level-qualification.model';

export const sampleWithRequiredData: IAdvancedLevelQualification = {
  id: 19870,
};

export const sampleWithPartialData: IAdvancedLevelQualification = {
  id: 19403,
  examYear: 18039,
  indexNumber: 'meanwhile gloomy',
  stream: 'hammock thankfully concerning',
};

export const sampleWithFullData: IAdvancedLevelQualification = {
  id: 21093,
  examYear: 82,
  indexNumber: 'wearily gently',
  stream: 'gnaw',
  medium: 'except muted furthermore',
  zScore: 16111.62,
};

export const sampleWithNewData: NewAdvancedLevelQualification = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
