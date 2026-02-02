import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../employment.test-samples';

import { EmploymentFormService } from './employment-form.service';

describe('Employment Form Service', () => {
  let service: EmploymentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploymentFormService);
  });

  describe('Service methods', () => {
    describe('createEmploymentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createEmploymentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            organizationName: expect.any(Object),
            designation: expect.any(Object),
            officialTelephone: expect.any(Object),
            officialAddress: expect.any(Object),
          }),
        );
      });

      it('passing IEmployment should create a new form with FormGroup', () => {
        const formGroup = service.createEmploymentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            organizationName: expect.any(Object),
            designation: expect.any(Object),
            officialTelephone: expect.any(Object),
            officialAddress: expect.any(Object),
          }),
        );
      });
    });

    describe('getEmployment', () => {
      it('should return NewEmployment for default Employment initial value', () => {
        const formGroup = service.createEmploymentFormGroup(sampleWithNewData);

        const employment = service.getEmployment(formGroup) as any;

        expect(employment).toMatchObject(sampleWithNewData);
      });

      it('should return NewEmployment for empty Employment initial value', () => {
        const formGroup = service.createEmploymentFormGroup();

        const employment = service.getEmployment(formGroup) as any;

        expect(employment).toMatchObject({});
      });

      it('should return IEmployment', () => {
        const formGroup = service.createEmploymentFormGroup(sampleWithRequiredData);

        const employment = service.getEmployment(formGroup) as any;

        expect(employment).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IEmployment should not enable id FormControl', () => {
        const formGroup = service.createEmploymentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewEmployment should disable id FormControl', () => {
        const formGroup = service.createEmploymentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
