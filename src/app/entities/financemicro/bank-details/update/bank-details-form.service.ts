import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IBankDetails, NewBankDetails } from '../bank-details.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IBankDetails for edit and NewBankDetailsFormGroupInput for create.
 */
type BankDetailsFormGroupInput = IBankDetails | PartialWithRequiredKeyOf<NewBankDetails>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IBankDetails | NewBankDetails> = Omit<T, 'lmd'> & {
  lmd?: string | null;
};

type BankDetailsFormRawValue = FormValueOf<IBankDetails>;

type NewBankDetailsFormRawValue = FormValueOf<NewBankDetails>;

type BankDetailsFormDefaults = Pick<NewBankDetails, 'id' | 'lmd' | 'isActive'>;

type BankDetailsFormGroupContent = {
  id: FormControl<BankDetailsFormRawValue['id'] | NewBankDetails['id']>;
  companyId: FormControl<BankDetailsFormRawValue['companyId']>;
  accountNumber: FormControl<BankDetailsFormRawValue['accountNumber']>;
  accountName: FormControl<BankDetailsFormRawValue['accountName']>;
  bankName: FormControl<BankDetailsFormRawValue['bankName']>;
  bankId: FormControl<BankDetailsFormRawValue['bankId']>;
  branchName: FormControl<BankDetailsFormRawValue['branchName']>;
  branchId: FormControl<BankDetailsFormRawValue['branchId']>;
  amount: FormControl<BankDetailsFormRawValue['amount']>;
  accountCode: FormControl<BankDetailsFormRawValue['accountCode']>;
  accountId: FormControl<BankDetailsFormRawValue['accountId']>;
  lmd: FormControl<BankDetailsFormRawValue['lmd']>;
  lmu: FormControl<BankDetailsFormRawValue['lmu']>;
  isActive: FormControl<BankDetailsFormRawValue['isActive']>;
  accountTypeId: FormControl<BankDetailsFormRawValue['accountTypeId']>;
};

export type BankDetailsFormGroup = FormGroup<BankDetailsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BankDetailsFormService {
  createBankDetailsFormGroup(bankDetails: BankDetailsFormGroupInput = { id: null }): BankDetailsFormGroup {
    const bankDetailsRawValue = this.convertBankDetailsToBankDetailsRawValue({
      ...this.getFormDefaults(),
      ...bankDetails,
    });
    return new FormGroup<BankDetailsFormGroupContent>({
      id: new FormControl(
        { value: bankDetailsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      companyId: new FormControl(bankDetailsRawValue.companyId),
      accountNumber: new FormControl(bankDetailsRawValue.accountNumber),
      accountName: new FormControl(bankDetailsRawValue.accountName),
      bankName: new FormControl(bankDetailsRawValue.bankName),
      bankId: new FormControl(bankDetailsRawValue.bankId),
      branchName: new FormControl(bankDetailsRawValue.branchName),
      branchId: new FormControl(bankDetailsRawValue.branchId),
      amount: new FormControl(bankDetailsRawValue.amount),
      accountCode: new FormControl(bankDetailsRawValue.accountCode),
      accountId: new FormControl(bankDetailsRawValue.accountId),
      lmd: new FormControl(bankDetailsRawValue.lmd),
      lmu: new FormControl(bankDetailsRawValue.lmu),
      isActive: new FormControl(bankDetailsRawValue.isActive),
      accountTypeId: new FormControl(bankDetailsRawValue.accountTypeId),
    });
  }

  getBankDetails(form: BankDetailsFormGroup): IBankDetails | NewBankDetails {
    return this.convertBankDetailsRawValueToBankDetails(form.getRawValue() as BankDetailsFormRawValue | NewBankDetailsFormRawValue);
  }

  resetForm(form: BankDetailsFormGroup, bankDetails: BankDetailsFormGroupInput): void {
    const bankDetailsRawValue = this.convertBankDetailsToBankDetailsRawValue({ ...this.getFormDefaults(), ...bankDetails });
    form.reset(
      {
        ...bankDetailsRawValue,
        id: { value: bankDetailsRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): BankDetailsFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lmd: currentTime,
      isActive: false,
    };
  }

  private convertBankDetailsRawValueToBankDetails(
    rawBankDetails: BankDetailsFormRawValue | NewBankDetailsFormRawValue,
  ): IBankDetails | NewBankDetails {
    return {
      ...rawBankDetails,
      lmd: dayjs(rawBankDetails.lmd, DATE_TIME_FORMAT),
    };
  }

  private convertBankDetailsToBankDetailsRawValue(
    bankDetails: IBankDetails | (Partial<NewBankDetails> & BankDetailsFormDefaults),
  ): BankDetailsFormRawValue | PartialWithRequiredKeyOf<NewBankDetailsFormRawValue> {
    return {
      ...bankDetails,
      lmd: bankDetails.lmd ? bankDetails.lmd.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
