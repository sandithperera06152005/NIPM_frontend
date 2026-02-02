import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IEmployment, NewEmployment } from '../employment.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEmployment for edit and NewEmploymentFormGroupInput for create.
 */
type EmploymentFormGroupInput = IEmployment | PartialWithRequiredKeyOf<NewEmployment>;

type EmploymentFormDefaults = Pick<NewEmployment, 'id'>;

type EmploymentFormGroupContent = {
  id: FormControl<IEmployment['id'] | NewEmployment['id']>;
  organizationName: FormControl<IEmployment['organizationName']>;
  designation: FormControl<IEmployment['designation']>;
  officialTelephone: FormControl<IEmployment['officialTelephone']>;
  officialAddress: FormControl<IEmployment['officialAddress']>;
};

export type EmploymentFormGroup = FormGroup<EmploymentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EmploymentFormService {
  createEmploymentFormGroup(employment: EmploymentFormGroupInput = { id: null }): EmploymentFormGroup {
    const employmentRawValue = {
      ...this.getFormDefaults(),
      ...employment,
    };
    return new FormGroup<EmploymentFormGroupContent>({
      id: new FormControl(
        { value: employmentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      organizationName: new FormControl(employmentRawValue.organizationName),
      designation: new FormControl(employmentRawValue.designation),
      officialTelephone: new FormControl(employmentRawValue.officialTelephone),
      officialAddress: new FormControl(employmentRawValue.officialAddress),
    });
  }

  getEmployment(form: EmploymentFormGroup): IEmployment | NewEmployment {
    return form.getRawValue() as IEmployment | NewEmployment;
  }

  resetForm(form: EmploymentFormGroup, employment: EmploymentFormGroupInput): void {
    const employmentRawValue = { ...this.getFormDefaults(), ...employment };
    form.reset(
      {
        ...employmentRawValue,
        id: { value: employmentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EmploymentFormDefaults {
    return {
      id: null,
    };
  }
}
