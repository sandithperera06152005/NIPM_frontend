import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPayment, NewPayment } from '../payment.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPayment for edit and NewPaymentFormGroupInput for create.
 */
type PaymentFormGroupInput = IPayment | PartialWithRequiredKeyOf<NewPayment>;

type PaymentFormDefaults = Pick<NewPayment, 'id'>;

type PaymentFormGroupContent = {
  id: FormControl<IPayment['id'] | NewPayment['id']>;
  memberID: FormControl<IPayment['memberID']>;
  paymentMethod: FormControl<IPayment['paymentMethod']>;
  amount: FormControl<IPayment['amount']>;
  referenceNumber: FormControl<IPayment['referenceNumber']>;
  paymentDate: FormControl<IPayment['paymentDate']>;
  paymentStatus: FormControl<IPayment['paymentStatus']>;
  membershipAdmission: FormControl<IPayment['membershipAdmission']>;
  applicant: FormControl<IPayment['applicant']>;
};

export type PaymentFormGroup = FormGroup<PaymentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaymentFormService {
  createPaymentFormGroup(payment: PaymentFormGroupInput = { id: null }): PaymentFormGroup {
    const paymentRawValue = {
      ...this.getFormDefaults(),
      ...payment,
    };
    return new FormGroup<PaymentFormGroupContent>({
      id: new FormControl(
        { value: paymentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      memberID: new FormControl(paymentRawValue.memberID),
      paymentMethod: new FormControl(paymentRawValue.paymentMethod),
      amount: new FormControl(paymentRawValue.amount),
      referenceNumber: new FormControl(paymentRawValue.referenceNumber),
      paymentDate: new FormControl(paymentRawValue.paymentDate),
      paymentStatus: new FormControl(paymentRawValue.paymentStatus),
      membershipAdmission: new FormControl(paymentRawValue.membershipAdmission),
      applicant: new FormControl(paymentRawValue.applicant),
    });
  }

  getPayment(form: PaymentFormGroup): IPayment | NewPayment {
    return form.getRawValue() as IPayment | NewPayment;
  }

  resetForm(form: PaymentFormGroup, payment: PaymentFormGroupInput): void {
    const paymentRawValue = { ...this.getFormDefaults(), ...payment };
    form.reset(
      {
        ...paymentRawValue,
        id: { value: paymentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PaymentFormDefaults {
    return {
      id: null,
    };
  }
}
