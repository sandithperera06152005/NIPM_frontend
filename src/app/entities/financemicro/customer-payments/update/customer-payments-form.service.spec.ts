import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../customer-payments.test-samples';

import { CustomerPaymentsFormService } from './customer-payments-form.service';

describe('CustomerPayments Form Service', () => {
  let service: CustomerPaymentsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerPaymentsFormService);
  });

  describe('Service methods', () => {
    describe('createCustomerPaymentsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createCustomerPaymentsFormGroup();

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
            invoiceCode: expect.any(Object),
            subTotal: expect.any(Object),
            owing: expect.any(Object),
            discount: expect.any(Object),
            serialNo: expect.any(Object),
            description: expect.any(Object),
            accountInv: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
          }),
        );
      });

      it('passing ICustomerPayments should create a new form with FormGroup', () => {
        const formGroup = service.createCustomerPaymentsFormGroup(sampleWithRequiredData);

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
            invoiceCode: expect.any(Object),
            subTotal: expect.any(Object),
            owing: expect.any(Object),
            discount: expect.any(Object),
            serialNo: expect.any(Object),
            description: expect.any(Object),
            accountInv: expect.any(Object),
            lmu: expect.any(Object),
            lmd: expect.any(Object),
          }),
        );
      });
    });

    describe('getCustomerPayments', () => {
      it('should return NewCustomerPayments for default CustomerPayments initial value', () => {
        const formGroup = service.createCustomerPaymentsFormGroup(sampleWithNewData);

        const customerPayments = service.getCustomerPayments(formGroup) as any;

        expect(customerPayments).toMatchObject(sampleWithNewData);
      });

      it('should return NewCustomerPayments for empty CustomerPayments initial value', () => {
        const formGroup = service.createCustomerPaymentsFormGroup();

        const customerPayments = service.getCustomerPayments(formGroup) as any;

        expect(customerPayments).toMatchObject({});
      });

      it('should return ICustomerPayments', () => {
        const formGroup = service.createCustomerPaymentsFormGroup(sampleWithRequiredData);

        const customerPayments = service.getCustomerPayments(formGroup) as any;

        expect(customerPayments).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ICustomerPayments should not enable id FormControl', () => {
        const formGroup = service.createCustomerPaymentsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewCustomerPayments should disable id FormControl', () => {
        const formGroup = service.createCustomerPaymentsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
