import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../advanced-level-subject.test-samples';

import { AdvancedLevelSubjectFormService } from './advanced-level-subject-form.service';

describe('AdvancedLevelSubject Form Service', () => {
  let service: AdvancedLevelSubjectFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedLevelSubjectFormService);
  });

  describe('Service methods', () => {
    describe('createAdvancedLevelSubjectFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            subjectName: expect.any(Object),
            grade: expect.any(Object),
            advancedLevelQualification: expect.any(Object),
          }),
        );
      });

      it('passing IAdvancedLevelSubject should create a new form with FormGroup', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            subjectName: expect.any(Object),
            grade: expect.any(Object),
            advancedLevelQualification: expect.any(Object),
          }),
        );
      });
    });

    describe('getAdvancedLevelSubject', () => {
      it('should return NewAdvancedLevelSubject for default AdvancedLevelSubject initial value', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup(sampleWithNewData);

        const advancedLevelSubject = service.getAdvancedLevelSubject(formGroup) as any;

        expect(advancedLevelSubject).toMatchObject(sampleWithNewData);
      });

      it('should return NewAdvancedLevelSubject for empty AdvancedLevelSubject initial value', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup();

        const advancedLevelSubject = service.getAdvancedLevelSubject(formGroup) as any;

        expect(advancedLevelSubject).toMatchObject({});
      });

      it('should return IAdvancedLevelSubject', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup(sampleWithRequiredData);

        const advancedLevelSubject = service.getAdvancedLevelSubject(formGroup) as any;

        expect(advancedLevelSubject).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAdvancedLevelSubject should not enable id FormControl', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAdvancedLevelSubject should disable id FormControl', () => {
        const formGroup = service.createAdvancedLevelSubjectFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
