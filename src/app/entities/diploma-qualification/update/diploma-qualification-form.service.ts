import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IDiplomaQualification, NewDiplomaQualification } from '../diploma-qualification.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDiplomaQualification for edit and NewDiplomaQualificationFormGroupInput for create.
 */
type DiplomaQualificationFormGroupInput = IDiplomaQualification | PartialWithRequiredKeyOf<NewDiplomaQualification>;

type DiplomaQualificationFormDefaults = Pick<NewDiplomaQualification, 'id'>;

type DiplomaQualificationFormGroupContent = {
  id: FormControl<IDiplomaQualification['id'] | NewDiplomaQualification['id']>;
  qualificationType: FormControl<IDiplomaQualification['qualificationType']>;
  diplomaProgramName: FormControl<IDiplomaQualification['diplomaProgramName']>;
  discipline: FormControl<IDiplomaQualification['discipline']>;
  instituteName: FormControl<IDiplomaQualification['instituteName']>;
  effectiveDate: FormControl<IDiplomaQualification['effectiveDate']>;
  certificateRefNumber: FormControl<IDiplomaQualification['certificateRefNumber']>;
  applicant: FormControl<IDiplomaQualification['applicant']>;
};

export type DiplomaQualificationFormGroup = FormGroup<DiplomaQualificationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DiplomaQualificationFormService {
  createDiplomaQualificationFormGroup(
    diplomaQualification: DiplomaQualificationFormGroupInput = { id: null },
  ): DiplomaQualificationFormGroup {
    const diplomaQualificationRawValue = {
      ...this.getFormDefaults(),
      ...diplomaQualification,
    };
    return new FormGroup<DiplomaQualificationFormGroupContent>({
      id: new FormControl(
        { value: diplomaQualificationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      qualificationType: new FormControl(diplomaQualificationRawValue.qualificationType),
      diplomaProgramName: new FormControl(diplomaQualificationRawValue.diplomaProgramName),
      discipline: new FormControl(diplomaQualificationRawValue.discipline),
      instituteName: new FormControl(diplomaQualificationRawValue.instituteName),
      effectiveDate: new FormControl(diplomaQualificationRawValue.effectiveDate),
      certificateRefNumber: new FormControl(diplomaQualificationRawValue.certificateRefNumber),
      applicant: new FormControl(diplomaQualificationRawValue.applicant),
    });
  }

  getDiplomaQualification(form: DiplomaQualificationFormGroup): IDiplomaQualification | NewDiplomaQualification {
    return form.getRawValue() as IDiplomaQualification | NewDiplomaQualification;
  }

  resetForm(form: DiplomaQualificationFormGroup, diplomaQualification: DiplomaQualificationFormGroupInput): void {
    const diplomaQualificationRawValue = { ...this.getFormDefaults(), ...diplomaQualification };
    form.reset(
      {
        ...diplomaQualificationRawValue,
        id: { value: diplomaQualificationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DiplomaQualificationFormDefaults {
    return {
      id: null,
    };
  }
}
