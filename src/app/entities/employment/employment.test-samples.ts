import { IEmployment, NewEmployment } from './employment.model';

export const sampleWithRequiredData: IEmployment = {
  id: 25501,
};

export const sampleWithPartialData: IEmployment = {
  id: 11072,
  officialAddress: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IEmployment = {
  id: 20260,
  organizationName: 'ecliptic',
  designation: 'knight woot unrealistic',
  officialTelephone: 'trench yet',
  officialAddress: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewEmployment = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
