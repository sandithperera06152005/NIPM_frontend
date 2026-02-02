import dayjs from 'dayjs/esm';

import { IIndustryExperience, NewIndustryExperience } from './industry-experience.model';

export const sampleWithRequiredData: IIndustryExperience = {
  id: 24099,
};

export const sampleWithPartialData: IIndustryExperience = {
  id: 12972,
  instituteName: 'after',
  toDate: dayjs('2026-02-01'),
  years: 31472,
  months: 17853,
};

export const sampleWithFullData: IIndustryExperience = {
  id: 7174,
  instituteName: 'which drat apropos',
  fromDate: dayjs('2026-02-01'),
  toDate: dayjs('2026-01-31'),
  years: 10191,
  months: 20348,
};

export const sampleWithNewData: NewIndustryExperience = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
