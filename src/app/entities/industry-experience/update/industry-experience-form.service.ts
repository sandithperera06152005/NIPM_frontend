import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IIndustryExperience, NewIndustryExperience } from '../industry-experience.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IIndustryExperience for edit and NewIndustryExperienceFormGroupInput for create.
 */
type IndustryExperienceFormGroupInput = IIndustryExperience | PartialWithRequiredKeyOf<NewIndustryExperience>;

type IndustryExperienceFormDefaults = Pick<NewIndustryExperience, 'id'>;

type IndustryExperienceFormGroupContent = {
  id: FormControl<IIndustryExperience['id'] | NewIndustryExperience['id']>;
  instituteName: FormControl<IIndustryExperience['instituteName']>;
  fromDate: FormControl<IIndustryExperience['fromDate']>;
  toDate: FormControl<IIndustryExperience['toDate']>;
  years: FormControl<IIndustryExperience['years']>;
  months: FormControl<IIndustryExperience['months']>;
  applicant: FormControl<IIndustryExperience['applicant']>;
};

export type IndustryExperienceFormGroup = FormGroup<IndustryExperienceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class IndustryExperienceFormService {
  createIndustryExperienceFormGroup(industryExperience: IndustryExperienceFormGroupInput = { id: null }): IndustryExperienceFormGroup {
    const industryExperienceRawValue = {
      ...this.getFormDefaults(),
      ...industryExperience,
    };
    return new FormGroup<IndustryExperienceFormGroupContent>({
      id: new FormControl(
        { value: industryExperienceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      instituteName: new FormControl(industryExperienceRawValue.instituteName),
      fromDate: new FormControl(industryExperienceRawValue.fromDate),
      toDate: new FormControl(industryExperienceRawValue.toDate),
      years: new FormControl(industryExperienceRawValue.years),
      months: new FormControl(industryExperienceRawValue.months),
      applicant: new FormControl(industryExperienceRawValue.applicant),
    });
  }

  getIndustryExperience(form: IndustryExperienceFormGroup): IIndustryExperience | NewIndustryExperience {
    return form.getRawValue() as IIndustryExperience | NewIndustryExperience;
  }

  resetForm(form: IndustryExperienceFormGroup, industryExperience: IndustryExperienceFormGroupInput): void {
    const industryExperienceRawValue = { ...this.getFormDefaults(), ...industryExperience };
    form.reset(
      {
        ...industryExperienceRawValue,
        id: { value: industryExperienceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): IndustryExperienceFormDefaults {
    return {
      id: null,
    };
  }
}
