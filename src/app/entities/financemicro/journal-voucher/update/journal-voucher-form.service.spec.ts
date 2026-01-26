import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../journal-voucher.test-samples';

import { JournalVoucherFormService } from './journal-voucher-form.service';

describe('JournalVoucher Form Service', () => {
  let service: JournalVoucherFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalVoucherFormService);
  });

  describe('Service methods', () => {
    describe('createJournalVoucherFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createJournalVoucherFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            date: expect.any(Object),
            debitTotal: expect.any(Object),
            creditTotal: expect.any(Object),
            comments: expect.any(Object),
            value: expect.any(Object),
            serialNo: expect.any(Object),
          }),
        );
      });

      it('passing IJournalVoucher should create a new form with FormGroup', () => {
        const formGroup = service.createJournalVoucherFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            date: expect.any(Object),
            debitTotal: expect.any(Object),
            creditTotal: expect.any(Object),
            comments: expect.any(Object),
            value: expect.any(Object),
            serialNo: expect.any(Object),
          }),
        );
      });
    });

    describe('getJournalVoucher', () => {
      it('should return NewJournalVoucher for default JournalVoucher initial value', () => {
        const formGroup = service.createJournalVoucherFormGroup(sampleWithNewData);

        const journalVoucher = service.getJournalVoucher(formGroup) as any;

        expect(journalVoucher).toMatchObject(sampleWithNewData);
      });

      it('should return NewJournalVoucher for empty JournalVoucher initial value', () => {
        const formGroup = service.createJournalVoucherFormGroup();

        const journalVoucher = service.getJournalVoucher(formGroup) as any;

        expect(journalVoucher).toMatchObject({});
      });

      it('should return IJournalVoucher', () => {
        const formGroup = service.createJournalVoucherFormGroup(sampleWithRequiredData);

        const journalVoucher = service.getJournalVoucher(formGroup) as any;

        expect(journalVoucher).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IJournalVoucher should not enable id FormControl', () => {
        const formGroup = service.createJournalVoucherFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewJournalVoucher should disable id FormControl', () => {
        const formGroup = service.createJournalVoucherFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
