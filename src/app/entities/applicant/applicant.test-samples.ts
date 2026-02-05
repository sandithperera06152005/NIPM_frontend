import dayjs from 'dayjs/esm';

import { IApplicant, NewApplicant } from './applicant.model';

export const sampleWithRequiredData: IApplicant = {
  id: 3066,
  fullName: 'up enhance around',
  declarationAccepted: true,
};

export const sampleWithPartialData: IApplicant = {
  id: 10019,
  fullName: 'lightly',
  initialsName: 'phooey ick duh',
  dateOfBirth: dayjs('2026-02-01'),
  nicNumber: 'effector chapel but',
  mobileNumber: 'trolley innocently',
  district: 'awkwardly faithfully phooey',
  financeType: 'SELF',
  sponsorName: 'how twist',
  declarationAccepted: false,
};

export const sampleWithFullData: IApplicant = {
  id: 4451,
  fullName: 'outside onto',
  initialsName: 'suffice dual colorfully',
  dateOfBirth: dayjs('2026-02-01'),
  gender: 'MALE',
  nationality: 'including information',
  nicNumber: 'SUV',
  email: 'Lamar_Feest41@gmail.com',
  mobileNumber: 'meh video',
  whatsappNumber: 'gah frugal',
  contactAddress: '../fake-data/blob/hipster.txt',
  permanentAddress: '../fake-data/blob/hipster.txt',
  district: 'darling',
  preferredCourseType: 'WEEKEND',
  financeType: 'SPONSORED',
  sponsorName: 'alienated so',
  declarationAccepted: true,
};

export const sampleWithNewData: NewApplicant = {
  fullName: 'powerful ornate amidst',
  declarationAccepted: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
