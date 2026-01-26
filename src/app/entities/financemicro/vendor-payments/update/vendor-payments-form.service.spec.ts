import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../vendor-payments.test-samples';

import { VendorPaymentsFormService } from './vendor-payments-form.service';

describe('VendorPayments Form Service', () => {
  let service: VendorPaymentsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorPaymentsFormService);
  });

  describe('Service methods', () => {
    describe('createVendorPaymentsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createVendorPaymentsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            opsUnitID: expect.any(Object),
            paymentId: expect.any(Object),
            paymentCode: expect.any(Object),
            date: expect.any(Object),
            address: expect.any(Object),
            email: expect.any(Object),
            contactNo: expect.any(Object),
            grnCode: expect.any(Object),
            subTotal: expect.any(Object),
            owing: expect.any(Object),
            discount: expect.any(Object),
            serialNo: expect.any(Object),
            description: expect.any(Object),
            accountInv: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
            amount: expect.any(Object),
          }),
        );
      });

      it('passing IVendorPayments should create a new form with FormGroup', () => {
        const formGroup = service.createVendorPaymentsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            opsUnitID: expect.any(Object),
            paymentId: expect.any(Object),
            paymentCode: expect.any(Object),
            date: expect.any(Object),
            address: expect.any(Object),
            email: expect.any(Object),
            contactNo: expect.any(Object),
            grnCode: expect.any(Object),
            subTotal: expect.any(Object),
            owing: expect.any(Object),
            discount: expect.any(Object),
            serialNo: expect.any(Object),
            description: expect.any(Object),
            accountInv: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
            amount: expect.any(Object),
          }),
        );
      });
    });

    describe('getVendorPayments', () => {
      it('should return NewVendorPayments for default VendorPayments initial value', () => {
        const formGroup = service.createVendorPaymentsFormGroup(sampleWithNewData);

        const vendorPayments = service.getVendorPayments(formGroup) as any;

        expect(vendorPayments).toMatchObject(sampleWithNewData);
      });

      it('should return NewVendorPayments for empty VendorPayments initial value', () => {
        const formGroup = service.createVendorPaymentsFormGroup();

        const vendorPayments = service.getVendorPayments(formGroup) as any;

        expect(vendorPayments).toMatchObject({});
      });

      it('should return IVendorPayments', () => {
        const formGroup = service.createVendorPaymentsFormGroup(sampleWithRequiredData);

        const vendorPayments = service.getVendorPayments(formGroup) as any;

        expect(vendorPayments).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IVendorPayments should not enable id FormControl', () => {
        const formGroup = service.createVendorPaymentsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewVendorPayments should disable id FormControl', () => {
        const formGroup = service.createVendorPaymentsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
