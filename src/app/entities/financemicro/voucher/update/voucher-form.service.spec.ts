import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../voucher.test-samples';

import { VoucherFormService } from './voucher-form.service';

describe('Voucher Form Service', () => {
  let service: VoucherFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherFormService);
  });

  describe('Service methods', () => {
    describe('createVoucherFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createVoucherFormGroup();

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
            depBank: expect.any(Object),
            bankId: expect.any(Object),
            branch: expect.any(Object),
            customerId: expect.any(Object),
            isActive: expect.any(Object),
            deposited: expect.any(Object),
            createdBy: expect.any(Object),
            amountNo: expect.any(Object),
            refNo: expect.any(Object),
            depAmount: expect.any(Object),
          }),
        );
      });

      it('passing IVoucher should create a new form with FormGroup', () => {
        const formGroup = service.createVoucherFormGroup(sampleWithRequiredData);

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
            depBank: expect.any(Object),
            bankId: expect.any(Object),
            branch: expect.any(Object),
            customerId: expect.any(Object),
            isActive: expect.any(Object),
            deposited: expect.any(Object),
            createdBy: expect.any(Object),
            amountNo: expect.any(Object),
            refNo: expect.any(Object),
            depAmount: expect.any(Object),
          }),
        );
      });
    });

    describe('getVoucher', () => {
      it('should return NewVoucher for default Voucher initial value', () => {
        const formGroup = service.createVoucherFormGroup(sampleWithNewData);

        const voucher = service.getVoucher(formGroup) as any;

        expect(voucher).toMatchObject(sampleWithNewData);
      });

      it('should return NewVoucher for empty Voucher initial value', () => {
        const formGroup = service.createVoucherFormGroup();

        const voucher = service.getVoucher(formGroup) as any;

        expect(voucher).toMatchObject({});
      });

      it('should return IVoucher', () => {
        const formGroup = service.createVoucherFormGroup(sampleWithRequiredData);

        const voucher = service.getVoucher(formGroup) as any;

        expect(voucher).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IVoucher should not enable id FormControl', () => {
        const formGroup = service.createVoucherFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewVoucher should disable id FormControl', () => {
        const formGroup = service.createVoucherFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
