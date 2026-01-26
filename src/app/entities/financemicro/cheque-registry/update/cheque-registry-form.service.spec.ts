import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../cheque-registry.test-samples';

import { ChequeRegistryFormService } from './cheque-registry-form.service';

describe('ChequeRegistry Form Service', () => {
  let service: ChequeRegistryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChequeRegistryFormService);
  });

  describe('Service methods', () => {
    describe('createChequeRegistryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createChequeRegistryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            receiptCode: expect.any(Object),
            customerName: expect.any(Object),
            bankName: expect.any(Object),
            chequeNo: expect.any(Object),
            amount: expect.any(Object),
            chequeDate: expect.any(Object),
            depositedDate: expect.any(Object),
            bankAccount: expect.any(Object),
            status: expect.any(Object),
            isChanged: expect.any(Object),
            chrFrmCus: expect.any(Object),
            returnFee: expect.any(Object),
            lmd: expect.any(Object),
            lmu: expect.any(Object),
          }),
        );
      });

      it('passing IChequeRegistry should create a new form with FormGroup', () => {
        const formGroup = service.createChequeRegistryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            receiptCode: expect.any(Object),
            customerName: expect.any(Object),
            bankName: expect.any(Object),
            chequeNo: expect.any(Object),
            amount: expect.any(Object),
            chequeDate: expect.any(Object),
            depositedDate: expect.any(Object),
            bankAccount: expect.any(Object),
            status: expect.any(Object),
            isChanged: expect.any(Object),
            chrFrmCus: expect.any(Object),
            returnFee: expect.any(Object),
            lmd: expect.any(Object),
            lmu: expect.any(Object),
          }),
        );
      });
    });

    describe('getChequeRegistry', () => {
      it('should return NewChequeRegistry for default ChequeRegistry initial value', () => {
        const formGroup = service.createChequeRegistryFormGroup(sampleWithNewData);

        const chequeRegistry = service.getChequeRegistry(formGroup) as any;

        expect(chequeRegistry).toMatchObject(sampleWithNewData);
      });

      it('should return NewChequeRegistry for empty ChequeRegistry initial value', () => {
        const formGroup = service.createChequeRegistryFormGroup();

        const chequeRegistry = service.getChequeRegistry(formGroup) as any;

        expect(chequeRegistry).toMatchObject({});
      });

      it('should return IChequeRegistry', () => {
        const formGroup = service.createChequeRegistryFormGroup(sampleWithRequiredData);

        const chequeRegistry = service.getChequeRegistry(formGroup) as any;

        expect(chequeRegistry).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IChequeRegistry should not enable id FormControl', () => {
        const formGroup = service.createChequeRegistryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewChequeRegistry should disable id FormControl', () => {
        const formGroup = service.createChequeRegistryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
