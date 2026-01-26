import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ICustomerPayments, NewCustomerPayments } from '../customer-payments.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICustomerPayments for edit and NewCustomerPaymentsFormGroupInput for create.
 */
type CustomerPaymentsFormGroupInput = ICustomerPayments | PartialWithRequiredKeyOf<NewCustomerPayments>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ICustomerPayments | NewCustomerPayments> = Omit<T, 'date' | 'lmd'> & {
  date?: string | null;
  lmd?: string | null;
};

type CustomerPaymentsFormRawValue = FormValueOf<ICustomerPayments>;

type NewCustomerPaymentsFormRawValue = FormValueOf<NewCustomerPayments>;

type CustomerPaymentsFormDefaults = Pick<NewCustomerPayments, 'id' | 'date' | 'lmd'>;

type CustomerPaymentsFormGroupContent = {
  id: FormControl<CustomerPaymentsFormRawValue['id'] | NewCustomerPayments['id']>;
  opsUnitID: FormControl<CustomerPaymentsFormRawValue['opsUnitID']>;
  paymentId: FormControl<CustomerPaymentsFormRawValue['paymentId']>;
  paymentCode: FormControl<CustomerPaymentsFormRawValue['paymentCode']>;
  date: FormControl<CustomerPaymentsFormRawValue['date']>;
  address: FormControl<CustomerPaymentsFormRawValue['address']>;
  email: FormControl<CustomerPaymentsFormRawValue['email']>;
  contactNo: FormControl<CustomerPaymentsFormRawValue['contactNo']>;
  invoiceCode: FormControl<CustomerPaymentsFormRawValue['invoiceCode']>;
  subTotal: FormControl<CustomerPaymentsFormRawValue['subTotal']>;
  owing: FormControl<CustomerPaymentsFormRawValue['owing']>;
  discount: FormControl<CustomerPaymentsFormRawValue['discount']>;
  serialNo: FormControl<CustomerPaymentsFormRawValue['serialNo']>;
  description: FormControl<CustomerPaymentsFormRawValue['description']>;
  accountInv: FormControl<CustomerPaymentsFormRawValue['accountInv']>;
  lmu: FormControl<CustomerPaymentsFormRawValue['lmu']>;
  lmd: FormControl<CustomerPaymentsFormRawValue['lmd']>;
};

export type CustomerPaymentsFormGroup = FormGroup<CustomerPaymentsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CustomerPaymentsFormService {
  createCustomerPaymentsFormGroup(customerPayments: CustomerPaymentsFormGroupInput = { id: null }): CustomerPaymentsFormGroup {
    const customerPaymentsRawValue = this.convertCustomerPaymentsToCustomerPaymentsRawValue({
      ...this.getFormDefaults(),
      ...customerPayments,
    });
    return new FormGroup<CustomerPaymentsFormGroupContent>({
      id: new FormControl(
        { value: customerPaymentsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      opsUnitID: new FormControl(customerPaymentsRawValue.opsUnitID),
      paymentId: new FormControl(customerPaymentsRawValue.paymentId),
      paymentCode: new FormControl(customerPaymentsRawValue.paymentCode),
      date: new FormControl(customerPaymentsRawValue.date),
      address: new FormControl(customerPaymentsRawValue.address),
      email: new FormControl(customerPaymentsRawValue.email),
      contactNo: new FormControl(customerPaymentsRawValue.contactNo),
      invoiceCode: new FormControl(customerPaymentsRawValue.invoiceCode),
      subTotal: new FormControl(customerPaymentsRawValue.subTotal),
      owing: new FormControl(customerPaymentsRawValue.owing),
      discount: new FormControl(customerPaymentsRawValue.discount),
      serialNo: new FormControl(customerPaymentsRawValue.serialNo),
      description: new FormControl(customerPaymentsRawValue.description),
      accountInv: new FormControl(customerPaymentsRawValue.accountInv),
      lmu: new FormControl(customerPaymentsRawValue.lmu),
      lmd: new FormControl(customerPaymentsRawValue.lmd),
    });
  }

  getCustomerPayments(form: CustomerPaymentsFormGroup): ICustomerPayments | NewCustomerPayments {
    return this.convertCustomerPaymentsRawValueToCustomerPayments(
      form.getRawValue() as CustomerPaymentsFormRawValue | NewCustomerPaymentsFormRawValue,
    );
  }

  resetForm(form: CustomerPaymentsFormGroup, customerPayments: CustomerPaymentsFormGroupInput): void {
    const customerPaymentsRawValue = this.convertCustomerPaymentsToCustomerPaymentsRawValue({
      ...this.getFormDefaults(),
      ...customerPayments,
    });
    form.reset(
      {
        ...customerPaymentsRawValue,
        id: { value: customerPaymentsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): CustomerPaymentsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      date: currentTime,
      lmd: currentTime,
    };
  }

  private convertCustomerPaymentsRawValueToCustomerPayments(
    rawCustomerPayments: CustomerPaymentsFormRawValue | NewCustomerPaymentsFormRawValue,
  ): ICustomerPayments | NewCustomerPayments {
    return {
      ...rawCustomerPayments,
      date: dayjs(rawCustomerPayments.date, DATE_TIME_FORMAT),
      lmd: dayjs(rawCustomerPayments.lmd, DATE_TIME_FORMAT),
    };
  }

  private convertCustomerPaymentsToCustomerPaymentsRawValue(
    customerPayments: ICustomerPayments | (Partial<NewCustomerPayments> & CustomerPaymentsFormDefaults),
  ): CustomerPaymentsFormRawValue | PartialWithRequiredKeyOf<NewCustomerPaymentsFormRawValue> {
    return {
      ...customerPayments,
      date: customerPayments.date ? customerPayments.date.format(DATE_TIME_FORMAT) : undefined,
      lmd: customerPayments.lmd ? customerPayments.lmd.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
