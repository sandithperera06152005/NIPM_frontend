import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../industry-experience.test-samples';

import { IndustryExperienceFormService } from './industry-experience-form.service';

describe('IndustryExperience Form Service', () => {
  let service: IndustryExperienceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndustryExperienceFormService);
  });

  describe('Service methods', () => {
    describe('createIndustryExperienceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createIndustryExperienceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            instituteName: expect.any(Object),
            fromDate: expect.any(Object),
            toDate: expect.any(Object),
            years: expect.any(Object),
            months: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });

      it('passing IIndustryExperience should create a new form with FormGroup', () => {
        const formGroup = service.createIndustryExperienceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            instituteName: expect.any(Object),
            fromDate: expect.any(Object),
            toDate: expect.any(Object),
            years: expect.any(Object),
            months: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });
    });

    describe('getIndustryExperience', () => {
      it('should return NewIndustryExperience for default IndustryExperience initial value', () => {
        const formGroup = service.createIndustryExperienceFormGroup(sampleWithNewData);

        const industryExperience = service.getIndustryExperience(formGroup) as any;

        expect(industryExperience).toMatchObject(sampleWithNewData);
      });

      it('should return NewIndustryExperience for empty IndustryExperience initial value', () => {
        const formGroup = service.createIndustryExperienceFormGroup();

        const industryExperience = service.getIndustryExperience(formGroup) as any;

        expect(industryExperience).toMatchObject({});
      });

      it('should return IIndustryExperience', () => {
        const formGroup = service.createIndustryExperienceFormGroup(sampleWithRequiredData);

        const industryExperience = service.getIndustryExperience(formGroup) as any;

        expect(industryExperience).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IIndustryExperience should not enable id FormControl', () => {
        const formGroup = service.createIndustryExperienceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewIndustryExperience should disable id FormControl', () => {
        const formGroup = service.createIndustryExperienceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
