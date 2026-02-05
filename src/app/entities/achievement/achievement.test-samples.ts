import { IAchievement, NewAchievement } from './achievement.model';

export const sampleWithRequiredData: IAchievement = {
  id: 379,
};

export const sampleWithPartialData: IAchievement = {
  id: 23663,
};

export const sampleWithFullData: IAchievement = {
  id: 28283,
  description: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewAchievement = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
