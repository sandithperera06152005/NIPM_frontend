import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IAdvancedLevelSubject, NewAdvancedLevelSubject } from '../advanced-level-subject.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAdvancedLevelSubject for edit and NewAdvancedLevelSubjectFormGroupInput for create.
 */
type AdvancedLevelSubjectFormGroupInput = IAdvancedLevelSubject | PartialWithRequiredKeyOf<NewAdvancedLevelSubject>;

type AdvancedLevelSubjectFormDefaults = Pick<NewAdvancedLevelSubject, 'id'>;

type AdvancedLevelSubjectFormGroupContent = {
  id: FormControl<IAdvancedLevelSubject['id'] | NewAdvancedLevelSubject['id']>;
  subjectName: FormControl<IAdvancedLevelSubject['subjectName']>;
  grade: FormControl<IAdvancedLevelSubject['grade']>;
  advancedLevelQualification: FormControl<IAdvancedLevelSubject['advancedLevelQualification']>;
};

export type AdvancedLevelSubjectFormGroup = FormGroup<AdvancedLevelSubjectFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AdvancedLevelSubjectFormService {
  createAdvancedLevelSubjectFormGroup(
    advancedLevelSubject: AdvancedLevelSubjectFormGroupInput = { id: null },
  ): AdvancedLevelSubjectFormGroup {
    const advancedLevelSubjectRawValue = {
      ...this.getFormDefaults(),
      ...advancedLevelSubject,
    };
    return new FormGroup<AdvancedLevelSubjectFormGroupContent>({
      id: new FormControl(
        { value: advancedLevelSubjectRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      subjectName: new FormControl(advancedLevelSubjectRawValue.subjectName),
      grade: new FormControl(advancedLevelSubjectRawValue.grade),
      advancedLevelQualification: new FormControl(advancedLevelSubjectRawValue.advancedLevelQualification),
    });
  }

  getAdvancedLevelSubject(form: AdvancedLevelSubjectFormGroup): IAdvancedLevelSubject | NewAdvancedLevelSubject {
    return form.getRawValue() as IAdvancedLevelSubject | NewAdvancedLevelSubject;
  }

  resetForm(form: AdvancedLevelSubjectFormGroup, advancedLevelSubject: AdvancedLevelSubjectFormGroupInput): void {
    const advancedLevelSubjectRawValue = { ...this.getFormDefaults(), ...advancedLevelSubject };
    form.reset(
      {
        ...advancedLevelSubjectRawValue,
        id: { value: advancedLevelSubjectRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AdvancedLevelSubjectFormDefaults {
    return {
      id: null,
    };
  }
}
