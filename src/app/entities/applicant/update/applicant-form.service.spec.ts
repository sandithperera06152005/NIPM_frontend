import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../applicant.test-samples';

import { ApplicantFormService } from './applicant-form.service';

describe('Applicant Form Service', () => {
  let service: ApplicantFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicantFormService);
  });

  describe('Service methods', () => {
    describe('createApplicantFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createApplicantFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fullName: expect.any(Object),
            initialsName: expect.any(Object),
            dateOfBirth: expect.any(Object),
            gender: expect.any(Object),
            nationality: expect.any(Object),
            nicNumber: expect.any(Object),
            email: expect.any(Object),
            mobileNumber: expect.any(Object),
            whatsappNumber: expect.any(Object),
            contactAddress: expect.any(Object),
            permanentAddress: expect.any(Object),
            district: expect.any(Object),
            preferredCourseType: expect.any(Object),
            financeType: expect.any(Object),
            sponsorName: expect.any(Object),
            declarationAccepted: expect.any(Object),
            employment: expect.any(Object),
          }),
        );
      });

      it('passing IApplicant should create a new form with FormGroup', () => {
        const formGroup = service.createApplicantFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fullName: expect.any(Object),
            initialsName: expect.any(Object),
            dateOfBirth: expect.any(Object),
            gender: expect.any(Object),
            nationality: expect.any(Object),
            nicNumber: expect.any(Object),
            email: expect.any(Object),
            mobileNumber: expect.any(Object),
            whatsappNumber: expect.any(Object),
            contactAddress: expect.any(Object),
            permanentAddress: expect.any(Object),
            district: expect.any(Object),
            preferredCourseType: expect.any(Object),
            financeType: expect.any(Object),
            sponsorName: expect.any(Object),
            declarationAccepted: expect.any(Object),
            employment: expect.any(Object),
          }),
        );
      });
    });

    describe('getApplicant', () => {
      it('should return NewApplicant for default Applicant initial value', () => {
        const formGroup = service.createApplicantFormGroup(sampleWithNewData);

        const applicant = service.getApplicant(formGroup) as any;

        expect(applicant).toMatchObject(sampleWithNewData);
      });

      it('should return NewApplicant for empty Applicant initial value', () => {
        const formGroup = service.createApplicantFormGroup();

        const applicant = service.getApplicant(formGroup) as any;

        expect(applicant).toMatchObject({});
      });

      it('should return IApplicant', () => {
        const formGroup = service.createApplicantFormGroup(sampleWithRequiredData);

        const applicant = service.getApplicant(formGroup) as any;

        expect(applicant).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IApplicant should not enable id FormControl', () => {
        const formGroup = service.createApplicantFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewApplicant should disable id FormControl', () => {
        const formGroup = service.createApplicantFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
