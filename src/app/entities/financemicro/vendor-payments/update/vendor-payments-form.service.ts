import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IVendorPayments, NewVendorPayments } from '../vendor-payments.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVendorPayments for edit and NewVendorPaymentsFormGroupInput for create.
 */
type VendorPaymentsFormGroupInput = IVendorPayments | PartialWithRequiredKeyOf<NewVendorPayments>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IVendorPayments | NewVendorPayments> = Omit<T, 'date' | 'lmd'> & {
  date?: string | null;
  lmd?: string | null;
};

type VendorPaymentsFormRawValue = FormValueOf<IVendorPayments>;

type NewVendorPaymentsFormRawValue = FormValueOf<NewVendorPayments>;

type VendorPaymentsFormDefaults = Pick<NewVendorPayments, 'id' | 'date' | 'lmd'>;

type VendorPaymentsFormGroupContent = {
  id: FormControl<VendorPaymentsFormRawValue['id'] | NewVendorPayments['id']>;
  opsUnitID: FormControl<VendorPaymentsFormRawValue['opsUnitID']>;
  paymentId: FormControl<VendorPaymentsFormRawValue['paymentId']>;
  paymentCode: FormControl<VendorPaymentsFormRawValue['paymentCode']>;
  date: FormControl<VendorPaymentsFormRawValue['date']>;
  address: FormControl<VendorPaymentsFormRawValue['address']>;
  email: FormControl<VendorPaymentsFormRawValue['email']>;
  contactNo: FormControl<VendorPaymentsFormRawValue['contactNo']>;
  grnCode: FormControl<VendorPaymentsFormRawValue['grnCode']>;
  subTotal: FormControl<VendorPaymentsFormRawValue['subTotal']>;
  owing: FormControl<VendorPaymentsFormRawValue['owing']>;
  discount: FormControl<VendorPaymentsFormRawValue['discount']>;
  serialNo: FormControl<VendorPaymentsFormRawValue['serialNo']>;
  description: FormControl<VendorPaymentsFormRawValue['description']>;
  accountInv: FormControl<VendorPaymentsFormRawValue['accountInv']>;
  lmu: FormControl<VendorPaymentsFormRawValue['lmu']>;
  lmd: FormControl<VendorPaymentsFormRawValue['lmd']>;
  amount: FormControl<VendorPaymentsFormRawValue['amount']>;
};

export type VendorPaymentsFormGroup = FormGroup<VendorPaymentsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VendorPaymentsFormService {
  createVendorPaymentsFormGroup(vendorPayments: VendorPaymentsFormGroupInput = { id: null }): VendorPaymentsFormGroup {
    const vendorPaymentsRawValue = this.convertVendorPaymentsToVendorPaymentsRawValue({
      ...this.getFormDefaults(),
      ...vendorPayments,
    });
    return new FormGroup<VendorPaymentsFormGroupContent>({
      id: new FormControl(
        { value: vendorPaymentsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      opsUnitID: new FormControl(vendorPaymentsRawValue.opsUnitID),
      paymentId: new FormControl(vendorPaymentsRawValue.paymentId),
      paymentCode: new FormControl(vendorPaymentsRawValue.paymentCode),
      date: new FormControl(vendorPaymentsRawValue.date),
      address: new FormControl(vendorPaymentsRawValue.address),
      email: new FormControl(vendorPaymentsRawValue.email),
      contactNo: new FormControl(vendorPaymentsRawValue.contactNo),
      grnCode: new FormControl(vendorPaymentsRawValue.grnCode),
      subTotal: new FormControl(vendorPaymentsRawValue.subTotal),
      owing: new FormControl(vendorPaymentsRawValue.owing),
      discount: new FormControl(vendorPaymentsRawValue.discount),
      serialNo: new FormControl(vendorPaymentsRawValue.serialNo),
      description: new FormControl(vendorPaymentsRawValue.description),
      accountInv: new FormControl(vendorPaymentsRawValue.accountInv),
      lmu: new FormControl(vendorPaymentsRawValue.lmu),
      lmd: new FormControl(vendorPaymentsRawValue.lmd),
      amount: new FormControl(vendorPaymentsRawValue.amount),
    });
  }

  getVendorPayments(form: VendorPaymentsFormGroup): IVendorPayments | NewVendorPayments {
    return this.convertVendorPaymentsRawValueToVendorPayments(
      form.getRawValue() as VendorPaymentsFormRawValue | NewVendorPaymentsFormRawValue,
    );
  }

  resetForm(form: VendorPaymentsFormGroup, vendorPayments: VendorPaymentsFormGroupInput): void {
    const vendorPaymentsRawValue = this.convertVendorPaymentsToVendorPaymentsRawValue({ ...this.getFormDefaults(), ...vendorPayments });
    form.reset(
      {
        ...vendorPaymentsRawValue,
        id: { value: vendorPaymentsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): VendorPaymentsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      date: currentTime,
      lmd: currentTime,
    };
  }

  private convertVendorPaymentsRawValueToVendorPayments(
    rawVendorPayments: VendorPaymentsFormRawValue | NewVendorPaymentsFormRawValue,
  ): IVendorPayments | NewVendorPayments {
    return {
      ...rawVendorPayments,
      date: dayjs(rawVendorPayments.date, DATE_TIME_FORMAT),
      lmd: dayjs(rawVendorPayments.lmd, DATE_TIME_FORMAT),
    };
  }

  private convertVendorPaymentsToVendorPaymentsRawValue(
    vendorPayments: IVendorPayments | (Partial<NewVendorPayments> & VendorPaymentsFormDefaults),
  ): VendorPaymentsFormRawValue | PartialWithRequiredKeyOf<NewVendorPaymentsFormRawValue> {
    return {
      ...vendorPayments,
      date: vendorPayments.date ? vendorPayments.date.format(DATE_TIME_FORMAT) : undefined,
      lmd: vendorPayments.lmd ? vendorPayments.lmd.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
