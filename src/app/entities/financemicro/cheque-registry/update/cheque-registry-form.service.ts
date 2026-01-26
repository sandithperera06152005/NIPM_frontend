import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChequeRegistry, NewChequeRegistry } from '../cheque-registry.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChequeRegistry for edit and NewChequeRegistryFormGroupInput for create.
 */
type ChequeRegistryFormGroupInput = IChequeRegistry | PartialWithRequiredKeyOf<NewChequeRegistry>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChequeRegistry | NewChequeRegistry> = Omit<T, 'chequeDate' | 'depositedDate' | 'lmd'> & {
  chequeDate?: string | null;
  depositedDate?: string | null;
  lmd?: string | null;
};

type ChequeRegistryFormRawValue = FormValueOf<IChequeRegistry>;

type NewChequeRegistryFormRawValue = FormValueOf<NewChequeRegistry>;

type ChequeRegistryFormDefaults = Pick<NewChequeRegistry, 'id' | 'chequeDate' | 'depositedDate' | 'isChanged' | 'chrFrmCus' | 'lmd'>;

type ChequeRegistryFormGroupContent = {
  id: FormControl<ChequeRegistryFormRawValue['id'] | NewChequeRegistry['id']>;
  receiptCode: FormControl<ChequeRegistryFormRawValue['receiptCode']>;
  customerName: FormControl<ChequeRegistryFormRawValue['customerName']>;
  bankName: FormControl<ChequeRegistryFormRawValue['bankName']>;
  chequeNo: FormControl<ChequeRegistryFormRawValue['chequeNo']>;
  amount: FormControl<ChequeRegistryFormRawValue['amount']>;
  chequeDate: FormControl<ChequeRegistryFormRawValue['chequeDate']>;
  depositedDate: FormControl<ChequeRegistryFormRawValue['depositedDate']>;
  bankAccount: FormControl<ChequeRegistryFormRawValue['bankAccount']>;
  status: FormControl<ChequeRegistryFormRawValue['status']>;
  isChanged: FormControl<ChequeRegistryFormRawValue['isChanged']>;
  chrFrmCus: FormControl<ChequeRegistryFormRawValue['chrFrmCus']>;
  returnFee: FormControl<ChequeRegistryFormRawValue['returnFee']>;
  lmd: FormControl<ChequeRegistryFormRawValue['lmd']>;
  lmu: FormControl<ChequeRegistryFormRawValue['lmu']>;
};

export type ChequeRegistryFormGroup = FormGroup<ChequeRegistryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChequeRegistryFormService {
  createChequeRegistryFormGroup(chequeRegistry: ChequeRegistryFormGroupInput = { id: null }): ChequeRegistryFormGroup {
    const chequeRegistryRawValue = this.convertChequeRegistryToChequeRegistryRawValue({
      ...this.getFormDefaults(),
      ...chequeRegistry,
    });
    return new FormGroup<ChequeRegistryFormGroupContent>({
      id: new FormControl(
        { value: chequeRegistryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      receiptCode: new FormControl(chequeRegistryRawValue.receiptCode, {
        validators: [Validators.required],
      }),
      customerName: new FormControl(chequeRegistryRawValue.customerName),
      bankName: new FormControl(chequeRegistryRawValue.bankName),
      chequeNo: new FormControl(chequeRegistryRawValue.chequeNo),
      amount: new FormControl(chequeRegistryRawValue.amount),
      chequeDate: new FormControl(chequeRegistryRawValue.chequeDate),
      depositedDate: new FormControl(chequeRegistryRawValue.depositedDate),
      bankAccount: new FormControl(chequeRegistryRawValue.bankAccount),
      status: new FormControl(chequeRegistryRawValue.status),
      isChanged: new FormControl(chequeRegistryRawValue.isChanged),
      chrFrmCus: new FormControl(chequeRegistryRawValue.chrFrmCus),
      returnFee: new FormControl(chequeRegistryRawValue.returnFee),
      lmd: new FormControl(chequeRegistryRawValue.lmd),
      lmu: new FormControl(chequeRegistryRawValue.lmu),
    });
  }

  getChequeRegistry(form: ChequeRegistryFormGroup): IChequeRegistry | NewChequeRegistry {
    return this.convertChequeRegistryRawValueToChequeRegistry(
      form.getRawValue() as ChequeRegistryFormRawValue | NewChequeRegistryFormRawValue,
    );
  }

  resetForm(form: ChequeRegistryFormGroup, chequeRegistry: ChequeRegistryFormGroupInput): void {
    const chequeRegistryRawValue = this.convertChequeRegistryToChequeRegistryRawValue({ ...this.getFormDefaults(), ...chequeRegistry });
    form.reset(
      {
        ...chequeRegistryRawValue,
        id: { value: chequeRegistryRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ChequeRegistryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      chequeDate: currentTime,
      depositedDate: currentTime,
      isChanged: false,
      chrFrmCus: false,
      lmd: currentTime,
    };
  }

  private convertChequeRegistryRawValueToChequeRegistry(
    rawChequeRegistry: ChequeRegistryFormRawValue | NewChequeRegistryFormRawValue,
  ): IChequeRegistry | NewChequeRegistry {
    return {
      ...rawChequeRegistry,
      chequeDate: dayjs(rawChequeRegistry.chequeDate, DATE_TIME_FORMAT),
      depositedDate: dayjs(rawChequeRegistry.depositedDate, DATE_TIME_FORMAT),
      lmd: dayjs(rawChequeRegistry.lmd, DATE_TIME_FORMAT),
    };
  }

  private convertChequeRegistryToChequeRegistryRawValue(
    chequeRegistry: IChequeRegistry | (Partial<NewChequeRegistry> & ChequeRegistryFormDefaults),
  ): ChequeRegistryFormRawValue | PartialWithRequiredKeyOf<NewChequeRegistryFormRawValue> {
    return {
      ...chequeRegistry,
      chequeDate: chequeRegistry.chequeDate ? chequeRegistry.chequeDate.format(DATE_TIME_FORMAT) : undefined,
      depositedDate: chequeRegistry.depositedDate ? chequeRegistry.depositedDate.format(DATE_TIME_FORMAT) : undefined,
      lmd: chequeRegistry.lmd ? chequeRegistry.lmd.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
