import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../receipt.test-samples';

import { ReceiptFormService } from './receipt-form.service';

describe('Receipt Form Service', () => {
  let service: ReceiptFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptFormService);
  });

  describe('Service methods', () => {
    describe('createReceiptFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createReceiptFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            receiptDate: expect.any(Object),
            customerName: expect.any(Object),
            customerAddress: expect.any(Object),
            totalAmount: expect.any(Object),
            totalAmountInWord: expect.any(Object),
            comments: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
            termId: expect.any(Object),
            term: expect.any(Object),
            date: expect.any(Object),
            amount: expect.any(Object),
            checkDate: expect.any(Object),
            checkNo: expect.any(Object),
            bank: expect.any(Object),
            customerId: expect.any(Object),
            isActive: expect.any(Object),
            deposited: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });

      it('passing IReceipt should create a new form with FormGroup', () => {
        const formGroup = service.createReceiptFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            receiptDate: expect.any(Object),
            customerName: expect.any(Object),
            customerAddress: expect.any(Object),
            totalAmount: expect.any(Object),
            totalAmountInWord: expect.any(Object),
            comments: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
            termId: expect.any(Object),
            term: expect.any(Object),
            date: expect.any(Object),
            amount: expect.any(Object),
            checkDate: expect.any(Object),
            checkNo: expect.any(Object),
            bank: expect.any(Object),
            customerId: expect.any(Object),
            isActive: expect.any(Object),
            deposited: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getReceipt', () => {
      it('should return NewReceipt for default Receipt initial value', () => {
        const formGroup = service.createReceiptFormGroup(sampleWithNewData);

        const receipt = service.getReceipt(formGroup) as any;

        expect(receipt).toMatchObject(sampleWithNewData);
      });

      it('should return NewReceipt for empty Receipt initial value', () => {
        const formGroup = service.createReceiptFormGroup();

        const receipt = service.getReceipt(formGroup) as any;

        expect(receipt).toMatchObject({});
      });

      it('should return IReceipt', () => {
        const formGroup = service.createReceiptFormGroup(sampleWithRequiredData);

        const receipt = service.getReceipt(formGroup) as any;

        expect(receipt).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IReceipt should not enable id FormControl', () => {
        const formGroup = service.createReceiptFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewReceipt should disable id FormControl', () => {
        const formGroup = service.createReceiptFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
