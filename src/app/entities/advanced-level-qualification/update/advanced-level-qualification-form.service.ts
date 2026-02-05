import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IAdvancedLevelQualification, NewAdvancedLevelQualification } from '../advanced-level-qualification.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAdvancedLevelQualification for edit and NewAdvancedLevelQualificationFormGroupInput for create.
 */
type AdvancedLevelQualificationFormGroupInput = IAdvancedLevelQualification | PartialWithRequiredKeyOf<NewAdvancedLevelQualification>;

type AdvancedLevelQualificationFormDefaults = Pick<NewAdvancedLevelQualification, 'id'>;

type AdvancedLevelQualificationFormGroupContent = {
  id: FormControl<IAdvancedLevelQualification['id'] | NewAdvancedLevelQualification['id']>;
  examYear: FormControl<IAdvancedLevelQualification['examYear']>;
  indexNumber: FormControl<IAdvancedLevelQualification['indexNumber']>;
  stream: FormControl<IAdvancedLevelQualification['stream']>;
  medium: FormControl<IAdvancedLevelQualification['medium']>;
  zScore: FormControl<IAdvancedLevelQualification['zScore']>;
  applicant: FormControl<IAdvancedLevelQualification['applicant']>;
};

export type AdvancedLevelQualificationFormGroup = FormGroup<AdvancedLevelQualificationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AdvancedLevelQualificationFormService {
  createAdvancedLevelQualificationFormGroup(
    advancedLevelQualification: AdvancedLevelQualificationFormGroupInput = { id: null },
  ): AdvancedLevelQualificationFormGroup {
    const advancedLevelQualificationRawValue = {
      ...this.getFormDefaults(),
      ...advancedLevelQualification,
    };
    return new FormGroup<AdvancedLevelQualificationFormGroupContent>({
      id: new FormControl(
        { value: advancedLevelQualificationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      examYear: new FormControl(advancedLevelQualificationRawValue.examYear),
      indexNumber: new FormControl(advancedLevelQualificationRawValue.indexNumber),
      stream: new FormControl(advancedLevelQualificationRawValue.stream),
      medium: new FormControl(advancedLevelQualificationRawValue.medium),
      zScore: new FormControl(advancedLevelQualificationRawValue.zScore),
      applicant: new FormControl(advancedLevelQualificationRawValue.applicant),
    });
  }

  getAdvancedLevelQualification(form: AdvancedLevelQualificationFormGroup): IAdvancedLevelQualification | NewAdvancedLevelQualification {
    return form.getRawValue() as IAdvancedLevelQualification | NewAdvancedLevelQualification;
  }

  resetForm(form: AdvancedLevelQualificationFormGroup, advancedLevelQualification: AdvancedLevelQualificationFormGroupInput): void {
    const advancedLevelQualificationRawValue = { ...this.getFormDefaults(), ...advancedLevelQualification };
    form.reset(
      {
        ...advancedLevelQualificationRawValue,
        id: { value: advancedLevelQualificationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AdvancedLevelQualificationFormDefaults {
    return {
      id: null,
    };
  }
}
