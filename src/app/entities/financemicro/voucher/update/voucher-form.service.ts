import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IVoucher, NewVoucher } from '../voucher.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVoucher for edit and NewVoucherFormGroupInput for create.
 */
type VoucherFormGroupInput = IVoucher | PartialWithRequiredKeyOf<NewVoucher>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IVoucher | NewVoucher> = Omit<T, 'receiptDate' | 'lmd' | 'date' | 'checkDate'> & {
  receiptDate?: string | null;
  lmd?: string | null;
  date?: string | null;
  checkDate?: string | null;
};

type VoucherFormRawValue = FormValueOf<IVoucher>;

type NewVoucherFormRawValue = FormValueOf<NewVoucher>;

type VoucherFormDefaults = Pick<NewVoucher, 'id' | 'receiptDate' | 'lmd' | 'date' | 'checkDate' | 'isActive' | 'deposited'>;

type VoucherFormGroupContent = {
  id: FormControl<VoucherFormRawValue['id'] | NewVoucher['id']>;
  code: FormControl<VoucherFormRawValue['code']>;
  receiptDate: FormControl<VoucherFormRawValue['receiptDate']>;
  customerName: FormControl<VoucherFormRawValue['customerName']>;
  customerAddress: FormControl<VoucherFormRawValue['customerAddress']>;
  totalAmount: FormControl<VoucherFormRawValue['totalAmount']>;
  totalAmountInWord: FormControl<VoucherFormRawValue['totalAmountInWord']>;
  comments: FormControl<VoucherFormRawValue['comments']>;
  lmu: FormControl<VoucherFormRawValue['lmu']>;
  lmd: FormControl<VoucherFormRawValue['lmd']>;
  termId: FormControl<VoucherFormRawValue['termId']>;
  term: FormControl<VoucherFormRawValue['term']>;
  date: FormControl<VoucherFormRawValue['date']>;
  amount: FormControl<VoucherFormRawValue['amount']>;
  checkDate: FormControl<VoucherFormRawValue['checkDate']>;
  checkNo: FormControl<VoucherFormRawValue['checkNo']>;
  bank: FormControl<VoucherFormRawValue['bank']>;
  depBank: FormControl<VoucherFormRawValue['depBank']>;
  bankId: FormControl<VoucherFormRawValue['bankId']>;
  branch: FormControl<VoucherFormRawValue['branch']>;
  customerId: FormControl<VoucherFormRawValue['customerId']>;
  isActive: FormControl<VoucherFormRawValue['isActive']>;
  deposited: FormControl<VoucherFormRawValue['deposited']>;
  createdBy: FormControl<VoucherFormRawValue['createdBy']>;
  amountNo: FormControl<VoucherFormRawValue['amountNo']>;
  refNo: FormControl<VoucherFormRawValue['refNo']>;
  depAmount: FormControl<VoucherFormRawValue['depAmount']>;
};

export type VoucherFormGroup = FormGroup<VoucherFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VoucherFormService {
  createVoucherFormGroup(voucher: VoucherFormGroupInput = { id: null }): VoucherFormGroup {
    const voucherRawValue = this.convertVoucherToVoucherRawValue({
      ...this.getFormDefaults(),
      ...voucher,
    });
    return new FormGroup<VoucherFormGroupContent>({
      id: new FormControl(
        { value: voucherRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(voucherRawValue.code),
      receiptDate: new FormControl(voucherRawValue.receiptDate),
      customerName: new FormControl(voucherRawValue.customerName),
      customerAddress: new FormControl(voucherRawValue.customerAddress),
      totalAmount: new FormControl(voucherRawValue.totalAmount),
      totalAmountInWord: new FormControl(voucherRawValue.totalAmountInWord),
      comments: new FormControl(voucherRawValue.comments),
      lmu: new FormControl(voucherRawValue.lmu),
      lmd: new FormControl(voucherRawValue.lmd),
      termId: new FormControl(voucherRawValue.termId),
      term: new FormControl(voucherRawValue.term),
      date: new FormControl(voucherRawValue.date),
      amount: new FormControl(voucherRawValue.amount),
      checkDate: new FormControl(voucherRawValue.checkDate),
      checkNo: new FormControl(voucherRawValue.checkNo),
      bank: new FormControl(voucherRawValue.bank),
      depBank: new FormControl(voucherRawValue.depBank),
      bankId: new FormControl(voucherRawValue.bankId),
      branch: new FormControl(voucherRawValue.branch),
      customerId: new FormControl(voucherRawValue.customerId),
      isActive: new FormControl(voucherRawValue.isActive),
      deposited: new FormControl(voucherRawValue.deposited),
      createdBy: new FormControl(voucherRawValue.createdBy),
      amountNo: new FormControl(voucherRawValue.amountNo),
      refNo: new FormControl(voucherRawValue.refNo),
      depAmount: new FormControl(voucherRawValue.depAmount),
    });
  }

  getVoucher(form: VoucherFormGroup): IVoucher | NewVoucher {
    return this.convertVoucherRawValueToVoucher(form.getRawValue() as VoucherFormRawValue | NewVoucherFormRawValue);
  }

  resetForm(form: VoucherFormGroup, voucher: VoucherFormGroupInput): void {
    const voucherRawValue = this.convertVoucherToVoucherRawValue({ ...this.getFormDefaults(), ...voucher });
    form.reset(
      {
        ...voucherRawValue,
        id: { value: voucherRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): VoucherFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      receiptDate: currentTime,
      lmd: currentTime,
      date: currentTime,
      checkDate: currentTime,
      isActive: false,
      deposited: false,
    };
  }

  private convertVoucherRawValueToVoucher(rawVoucher: VoucherFormRawValue | NewVoucherFormRawValue): IVoucher | NewVoucher {
    return {
      ...rawVoucher,
      receiptDate: dayjs(rawVoucher.receiptDate, DATE_TIME_FORMAT),
      lmd: dayjs(rawVoucher.lmd, DATE_TIME_FORMAT),
      date: dayjs(rawVoucher.date, DATE_TIME_FORMAT),
      checkDate: dayjs(rawVoucher.checkDate, DATE_TIME_FORMAT),
    };
  }

  private convertVoucherToVoucherRawValue(
    voucher: IVoucher | (Partial<NewVoucher> & VoucherFormDefaults),
  ): VoucherFormRawValue | PartialWithRequiredKeyOf<NewVoucherFormRawValue> {
    return {
      ...voucher,
      receiptDate: voucher.receiptDate ? voucher.receiptDate.format(DATE_TIME_FORMAT) : undefined,
      lmd: voucher.lmd ? voucher.lmd.format(DATE_TIME_FORMAT) : undefined,
      date: voucher.date ? voucher.date.format(DATE_TIME_FORMAT) : undefined,
      checkDate: voucher.checkDate ? voucher.checkDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
