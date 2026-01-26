import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IJournalVoucher, NewJournalVoucher } from '../journal-voucher.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IJournalVoucher for edit and NewJournalVoucherFormGroupInput for create.
 */
type JournalVoucherFormGroupInput = IJournalVoucher | PartialWithRequiredKeyOf<NewJournalVoucher>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IJournalVoucher | NewJournalVoucher> = Omit<T, 'date'> & {
  date?: string | null;
};

type JournalVoucherFormRawValue = FormValueOf<IJournalVoucher>;

type NewJournalVoucherFormRawValue = FormValueOf<NewJournalVoucher>;

type JournalVoucherFormDefaults = Pick<NewJournalVoucher, 'id' | 'date'>;

type JournalVoucherFormGroupContent = {
  id: FormControl<JournalVoucherFormRawValue['id'] | NewJournalVoucher['id']>;
  code: FormControl<JournalVoucherFormRawValue['code']>;
  date: FormControl<JournalVoucherFormRawValue['date']>;
  debitTotal: FormControl<JournalVoucherFormRawValue['debitTotal']>;
  creditTotal: FormControl<JournalVoucherFormRawValue['creditTotal']>;
  comments: FormControl<JournalVoucherFormRawValue['comments']>;
  value: FormControl<JournalVoucherFormRawValue['value']>;
  serialNo: FormControl<JournalVoucherFormRawValue['serialNo']>;
};

export type JournalVoucherFormGroup = FormGroup<JournalVoucherFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class JournalVoucherFormService {
  createJournalVoucherFormGroup(journalVoucher: JournalVoucherFormGroupInput = { id: null }): JournalVoucherFormGroup {
    const journalVoucherRawValue = this.convertJournalVoucherToJournalVoucherRawValue({
      ...this.getFormDefaults(),
      ...journalVoucher,
    });
    return new FormGroup<JournalVoucherFormGroupContent>({
      id: new FormControl(
        { value: journalVoucherRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(journalVoucherRawValue.code),
      date: new FormControl(journalVoucherRawValue.date),
      debitTotal: new FormControl(journalVoucherRawValue.debitTotal),
      creditTotal: new FormControl(journalVoucherRawValue.creditTotal),
      comments: new FormControl(journalVoucherRawValue.comments),
      value: new FormControl(journalVoucherRawValue.value),
      serialNo: new FormControl(journalVoucherRawValue.serialNo),
    });
  }

  getJournalVoucher(form: JournalVoucherFormGroup): IJournalVoucher | NewJournalVoucher {
    return this.convertJournalVoucherRawValueToJournalVoucher(
      form.getRawValue() as JournalVoucherFormRawValue | NewJournalVoucherFormRawValue,
    );
  }

  resetForm(form: JournalVoucherFormGroup, journalVoucher: JournalVoucherFormGroupInput): void {
    const journalVoucherRawValue = this.convertJournalVoucherToJournalVoucherRawValue({ ...this.getFormDefaults(), ...journalVoucher });
    form.reset(
      {
        ...journalVoucherRawValue,
        id: { value: journalVoucherRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): JournalVoucherFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      date: currentTime,
    };
  }

  private convertJournalVoucherRawValueToJournalVoucher(
    rawJournalVoucher: JournalVoucherFormRawValue | NewJournalVoucherFormRawValue,
  ): IJournalVoucher | NewJournalVoucher {
    return {
      ...rawJournalVoucher,
      date: dayjs(rawJournalVoucher.date, DATE_TIME_FORMAT),
    };
  }

  private convertJournalVoucherToJournalVoucherRawValue(
    journalVoucher: IJournalVoucher | (Partial<NewJournalVoucher> & JournalVoucherFormDefaults),
  ): JournalVoucherFormRawValue | PartialWithRequiredKeyOf<NewJournalVoucherFormRawValue> {
    return {
      ...journalVoucher,
      date: journalVoucher.date ? journalVoucher.date.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
