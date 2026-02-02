import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../diploma-qualification.test-samples';

import { DiplomaQualificationFormService } from './diploma-qualification-form.service';

describe('DiplomaQualification Form Service', () => {
  let service: DiplomaQualificationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiplomaQualificationFormService);
  });

  describe('Service methods', () => {
    describe('createDiplomaQualificationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDiplomaQualificationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            qualificationType: expect.any(Object),
            diplomaProgramName: expect.any(Object),
            discipline: expect.any(Object),
            instituteName: expect.any(Object),
            effectiveDate: expect.any(Object),
            certificateRefNumber: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });

      it('passing IDiplomaQualification should create a new form with FormGroup', () => {
        const formGroup = service.createDiplomaQualificationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            qualificationType: expect.any(Object),
            diplomaProgramName: expect.any(Object),
            discipline: expect.any(Object),
            instituteName: expect.any(Object),
            effectiveDate: expect.any(Object),
            certificateRefNumber: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });
    });

    describe('getDiplomaQualification', () => {
      it('should return NewDiplomaQualification for default DiplomaQualification initial value', () => {
        const formGroup = service.createDiplomaQualificationFormGroup(sampleWithNewData);

        const diplomaQualification = service.getDiplomaQualification(formGroup) as any;

        expect(diplomaQualification).toMatchObject(sampleWithNewData);
      });

      it('should return NewDiplomaQualification for empty DiplomaQualification initial value', () => {
        const formGroup = service.createDiplomaQualificationFormGroup();

        const diplomaQualification = service.getDiplomaQualification(formGroup) as any;

        expect(diplomaQualification).toMatchObject({});
      });

      it('should return IDiplomaQualification', () => {
        const formGroup = service.createDiplomaQualificationFormGroup(sampleWithRequiredData);

        const diplomaQualification = service.getDiplomaQualification(formGroup) as any;

        expect(diplomaQualification).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDiplomaQualification should not enable id FormControl', () => {
        const formGroup = service.createDiplomaQualificationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDiplomaQualification should disable id FormControl', () => {
        const formGroup = service.createDiplomaQualificationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
