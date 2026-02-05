import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../advanced-level-qualification.test-samples';

import { AdvancedLevelQualificationFormService } from './advanced-level-qualification-form.service';

describe('AdvancedLevelQualification Form Service', () => {
  let service: AdvancedLevelQualificationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedLevelQualificationFormService);
  });

  describe('Service methods', () => {
    describe('createAdvancedLevelQualificationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            examYear: expect.any(Object),
            indexNumber: expect.any(Object),
            stream: expect.any(Object),
            medium: expect.any(Object),
            zScore: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });

      it('passing IAdvancedLevelQualification should create a new form with FormGroup', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            examYear: expect.any(Object),
            indexNumber: expect.any(Object),
            stream: expect.any(Object),
            medium: expect.any(Object),
            zScore: expect.any(Object),
            applicant: expect.any(Object),
          }),
        );
      });
    });

    describe('getAdvancedLevelQualification', () => {
      it('should return NewAdvancedLevelQualification for default AdvancedLevelQualification initial value', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup(sampleWithNewData);

        const advancedLevelQualification = service.getAdvancedLevelQualification(formGroup) as any;

        expect(advancedLevelQualification).toMatchObject(sampleWithNewData);
      });

      it('should return NewAdvancedLevelQualification for empty AdvancedLevelQualification initial value', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup();

        const advancedLevelQualification = service.getAdvancedLevelQualification(formGroup) as any;

        expect(advancedLevelQualification).toMatchObject({});
      });

      it('should return IAdvancedLevelQualification', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup(sampleWithRequiredData);

        const advancedLevelQualification = service.getAdvancedLevelQualification(formGroup) as any;

        expect(advancedLevelQualification).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAdvancedLevelQualification should not enable id FormControl', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAdvancedLevelQualification should disable id FormControl', () => {
        const formGroup = service.createAdvancedLevelQualificationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
