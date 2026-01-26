import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../bank-details.test-samples';

import { BankDetailsFormService } from './bank-details-form.service';

describe('BankDetails Form Service', () => {
  let service: BankDetailsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankDetailsFormService);
  });

  describe('Service methods', () => {
    describe('createBankDetailsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createBankDetailsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            companyId: expect.any(Object),
            accountNumber: expect.any(Object),
            accountName: expect.any(Object),
            bankName: expect.any(Object),
            bankId: expect.any(Object),
            branchName: expect.any(Object),
            branchId: expect.any(Object),
            amount: expect.any(Object),
            accountCode: expect.any(Object),
            accountId: expect.any(Object),
            lmd: expect.any(Object),
            lmu: expect.any(Object),
            isActive: expect.any(Object),
            accountTypeId: expect.any(Object),
          }),
        );
      });

      it('passing IBankDetails should create a new form with FormGroup', () => {
        const formGroup = service.createBankDetailsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            companyId: expect.any(Object),
            accountNumber: expect.any(Object),
            accountName: expect.any(Object),
            bankName: expect.any(Object),
            bankId: expect.any(Object),
            branchName: expect.any(Object),
            branchId: expect.any(Object),
            amount: expect.any(Object),
            accountCode: expect.any(Object),
            accountId: expect.any(Object),
            lmd: expect.any(Object),
            lmu: expect.any(Object),
            isActive: expect.any(Object),
            accountTypeId: expect.any(Object),
          }),
        );
      });
    });

    describe('getBankDetails', () => {
      it('should return NewBankDetails for default BankDetails initial value', () => {
        const formGroup = service.createBankDetailsFormGroup(sampleWithNewData);

        const bankDetails = service.getBankDetails(formGroup) as any;

        expect(bankDetails).toMatchObject(sampleWithNewData);
      });

      it('should return NewBankDetails for empty BankDetails initial value', () => {
        const formGroup = service.createBankDetailsFormGroup();

        const bankDetails = service.getBankDetails(formGroup) as any;

        expect(bankDetails).toMatchObject({});
      });

      it('should return IBankDetails', () => {
        const formGroup = service.createBankDetailsFormGroup(sampleWithRequiredData);

        const bankDetails = service.getBankDetails(formGroup) as any;

        expect(bankDetails).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IBankDetails should not enable id FormControl', () => {
        const formGroup = service.createBankDetailsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewBankDetails should disable id FormControl', () => {
        const formGroup = service.createBankDetailsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
