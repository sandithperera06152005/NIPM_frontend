import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IReceipt, NewReceipt } from '../receipt.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IReceipt for edit and NewReceiptFormGroupInput for create.
 */
type ReceiptFormGroupInput = IReceipt | PartialWithRequiredKeyOf<NewReceipt>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IReceipt | NewReceipt> = Omit<T, 'receiptDate' | 'lmd' | 'date' | 'checkDate'> & {
  receiptDate?: string | null;
  lmd?: string | null;
  date?: string | null;
  checkDate?: string | null;
};

type ReceiptFormRawValue = FormValueOf<IReceipt>;

type NewReceiptFormRawValue = FormValueOf<NewReceipt>;

type ReceiptFormDefaults = Pick<NewReceipt, 'id' | 'receiptDate' | 'lmd' | 'date' | 'checkDate' | 'isActive' | 'deposited'>;

type ReceiptFormGroupContent = {
  id: FormControl<ReceiptFormRawValue['id'] | NewReceipt['id']>;
  code: FormControl<ReceiptFormRawValue['code']>;
  receiptDate: FormControl<ReceiptFormRawValue['receiptDate']>;
  customerName: FormControl<ReceiptFormRawValue['customerName']>;
  customerAddress: FormControl<ReceiptFormRawValue['customerAddress']>;
  totalAmount: FormControl<ReceiptFormRawValue['totalAmount']>;
  totalAmountInWord: FormControl<ReceiptFormRawValue['totalAmountInWord']>;
  comments: FormControl<ReceiptFormRawValue['comments']>;
  lmu: FormControl<ReceiptFormRawValue['lmu']>;
  lmd: FormControl<ReceiptFormRawValue['lmd']>;
  termId: FormControl<ReceiptFormRawValue['termId']>;
  term: FormControl<ReceiptFormRawValue['term']>;
  date: FormControl<ReceiptFormRawValue['date']>;
  amount: FormControl<ReceiptFormRawValue['amount']>;
  checkDate: FormControl<ReceiptFormRawValue['checkDate']>;
  checkNo: FormControl<ReceiptFormRawValue['checkNo']>;
  bank: FormControl<ReceiptFormRawValue['bank']>;
  customerId: FormControl<ReceiptFormRawValue['customerId']>;
  isActive: FormControl<ReceiptFormRawValue['isActive']>;
  deposited: FormControl<ReceiptFormRawValue['deposited']>;
  createdBy: FormControl<ReceiptFormRawValue['createdBy']>;
};

export type ReceiptFormGroup = FormGroup<ReceiptFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ReceiptFormService {
  createReceiptFormGroup(receipt: ReceiptFormGroupInput = { id: null }): ReceiptFormGroup {
    const receiptRawValue = this.convertReceiptToReceiptRawValue({
      ...this.getFormDefaults(),
      ...receipt,
    });
    return new FormGroup<ReceiptFormGroupContent>({
      id: new FormControl(
        { value: receiptRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(receiptRawValue.code, {
        validators: [Validators.maxLength(50)],
      }),
      receiptDate: new FormControl(receiptRawValue.receiptDate),
      customerName: new FormControl(receiptRawValue.customerName, {
        validators: [Validators.maxLength(128)],
      }),
      customerAddress: new FormControl(receiptRawValue.customerAddress, {
        validators: [Validators.maxLength(512)],
      }),
      totalAmount: new FormControl(receiptRawValue.totalAmount),
      totalAmountInWord: new FormControl(receiptRawValue.totalAmountInWord, {
        validators: [Validators.maxLength(500)],
      }),
      comments: new FormControl(receiptRawValue.comments, {
        validators: [Validators.maxLength(100)],
      }),
      lmu: new FormControl(receiptRawValue.lmu),
      lmd: new FormControl(receiptRawValue.lmd),
      termId: new FormControl(receiptRawValue.termId),
      term: new FormControl(receiptRawValue.term, {
        validators: [Validators.maxLength(100)],
      }),
      date: new FormControl(receiptRawValue.date),
      amount: new FormControl(receiptRawValue.amount),
      checkDate: new FormControl(receiptRawValue.checkDate),
      checkNo: new FormControl(receiptRawValue.checkNo, {
        validators: [Validators.maxLength(100)],
      }),
      bank: new FormControl(receiptRawValue.bank, {
        validators: [Validators.maxLength(100)],
      }),
      customerId: new FormControl(receiptRawValue.customerId),
      isActive: new FormControl(receiptRawValue.isActive),
      deposited: new FormControl(receiptRawValue.deposited),
      createdBy: new FormControl(receiptRawValue.createdBy),
    });
  }

  getReceipt(form: ReceiptFormGroup): IReceipt | NewReceipt {
    return this.convertReceiptRawValueToReceipt(form.getRawValue() as ReceiptFormRawValue | NewReceiptFormRawValue);
  }

  resetForm(form: ReceiptFormGroup, receipt: ReceiptFormGroupInput): void {
    const receiptRawValue = this.convertReceiptToReceiptRawValue({ ...this.getFormDefaults(), ...receipt });
    form.reset(
      {
        ...receiptRawValue,
        id: { value: receiptRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ReceiptFormDefaults {
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

  private convertReceiptRawValueToReceipt(rawReceipt: ReceiptFormRawValue | NewReceiptFormRawValue): IReceipt | NewReceipt {
    return {
      ...rawReceipt,
      receiptDate: dayjs(rawReceipt.receiptDate, DATE_TIME_FORMAT),
      lmd: dayjs(rawReceipt.lmd, DATE_TIME_FORMAT),
      date: dayjs(rawReceipt.date, DATE_TIME_FORMAT),
      checkDate: dayjs(rawReceipt.checkDate, DATE_TIME_FORMAT),
    };
  }

  private convertReceiptToReceiptRawValue(
    receipt: IReceipt | (Partial<NewReceipt> & ReceiptFormDefaults),
  ): ReceiptFormRawValue | PartialWithRequiredKeyOf<NewReceiptFormRawValue> {
    return {
      ...receipt,
      receiptDate: receipt.receiptDate ? receipt.receiptDate.format(DATE_TIME_FORMAT) : undefined,
      lmd: receipt.lmd ? receipt.lmd.format(DATE_TIME_FORMAT) : undefined,
      date: receipt.date ? receipt.date.format(DATE_TIME_FORMAT) : undefined,
      checkDate: receipt.checkDate ? receipt.checkDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
