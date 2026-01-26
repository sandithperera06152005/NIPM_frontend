import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IBankAccount, NewBankAccount } from '../bank-account.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IBankAccount for edit and NewBankAccountFormGroupInput for create.
 */
type BankAccountFormGroupInput = IBankAccount | PartialWithRequiredKeyOf<NewBankAccount>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IBankAccount | NewBankAccount> = Omit<T, 'lmd'> & {
  lmd?: string | null;
};

type BankAccountFormRawValue = FormValueOf<IBankAccount>;

type NewBankAccountFormRawValue = FormValueOf<NewBankAccount>;

type BankAccountFormDefaults = Pick<NewBankAccount, 'id' | 'lmd' | 'isActive'>;

type BankAccountFormGroupContent = {
  id: FormControl<BankAccountFormRawValue['id'] | NewBankAccount['id']>;
  companyId: FormControl<BankAccountFormRawValue['companyId']>;
  accountNumber: FormControl<BankAccountFormRawValue['accountNumber']>;
  accountName: FormControl<BankAccountFormRawValue['accountName']>;
  bankName: FormControl<BankAccountFormRawValue['bankName']>;
  bankId: FormControl<BankAccountFormRawValue['bankId']>;
  branchName: FormControl<BankAccountFormRawValue['branchName']>;
  branchId: FormControl<BankAccountFormRawValue['branchId']>;
  amount: FormControl<BankAccountFormRawValue['amount']>;
  accountCode: FormControl<BankAccountFormRawValue['accountCode']>;
  accountId: FormControl<BankAccountFormRawValue['accountId']>;
  lmd: FormControl<BankAccountFormRawValue['lmd']>;
  lmu: FormControl<BankAccountFormRawValue['lmu']>;
  isActive: FormControl<BankAccountFormRawValue['isActive']>;
  accountTypeId: FormControl<BankAccountFormRawValue['accountTypeId']>;
};

export type BankAccountFormGroup = FormGroup<BankAccountFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BankAccountFormService {
  createBankAccountFormGroup(bankAccount: BankAccountFormGroupInput = { id: null }): BankAccountFormGroup {
    const bankAccountRawValue = this.convertBankAccountToBankAccountRawValue({
      ...this.getFormDefaults(),
      ...bankAccount,
    });
    return new FormGroup<BankAccountFormGroupContent>({
      id: new FormControl(
        { value: bankAccountRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      companyId: new FormControl(bankAccountRawValue.companyId),
      accountNumber: new FormControl(bankAccountRawValue.accountNumber),
      accountName: new FormControl(bankAccountRawValue.accountName),
      bankName: new FormControl(bankAccountRawValue.bankName),
      bankId: new FormControl(bankAccountRawValue.bankId),
      branchName: new FormControl(bankAccountRawValue.branchName),
      branchId: new FormControl(bankAccountRawValue.branchId),
      amount: new FormControl(bankAccountRawValue.amount),
      accountCode: new FormControl(bankAccountRawValue.accountCode),
      accountId: new FormControl(bankAccountRawValue.accountId),
      lmd: new FormControl(bankAccountRawValue.lmd),
      lmu: new FormControl(bankAccountRawValue.lmu),
      isActive: new FormControl(bankAccountRawValue.isActive),
      accountTypeId: new FormControl(bankAccountRawValue.accountTypeId),
    });
  }

  getBankAccount(form: BankAccountFormGroup): IBankAccount | NewBankAccount {
    return this.convertBankAccountRawValueToBankAccount(form.getRawValue() as BankAccountFormRawValue | NewBankAccountFormRawValue);
  }

  resetForm(form: BankAccountFormGroup, bankAccount: BankAccountFormGroupInput): void {
    const bankAccountRawValue = this.convertBankAccountToBankAccountRawValue({ ...this.getFormDefaults(), ...bankAccount });
    form.reset(
      {
        ...bankAccountRawValue,
        id: { value: bankAccountRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): BankAccountFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lmd: currentTime,
      isActive: false,
    };
  }

  private convertBankAccountRawValueToBankAccount(
    rawBankAccount: BankAccountFormRawValue | NewBankAccountFormRawValue,
  ): IBankAccount | NewBankAccount {
    return {
      ...rawBankAccount,
      lmd: dayjs(rawBankAccount.lmd, DATE_TIME_FORMAT),
    };
  }

  private convertBankAccountToBankAccountRawValue(
    bankAccount: IBankAccount | (Partial<NewBankAccount> & BankAccountFormDefaults),
  ): BankAccountFormRawValue | PartialWithRequiredKeyOf<NewBankAccountFormRawValue> {
    return {
      ...bankAccount,
      lmd: bankAccount.lmd ? bankAccount.lmd.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
