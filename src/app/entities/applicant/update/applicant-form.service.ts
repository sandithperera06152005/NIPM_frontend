import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IApplicant, NewApplicant } from '../applicant.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IApplicant for edit and NewApplicantFormGroupInput for create.
 */
type ApplicantFormGroupInput = IApplicant | PartialWithRequiredKeyOf<NewApplicant>;

type ApplicantFormDefaults = Pick<NewApplicant, 'id' | 'declarationAccepted'>;

type ApplicantFormGroupContent = {
  id: FormControl<IApplicant['id'] | NewApplicant['id']>;
  fullName: FormControl<IApplicant['fullName']>;
  initialsName: FormControl<IApplicant['initialsName']>;
  dateOfBirth: FormControl<IApplicant['dateOfBirth']>;
  gender: FormControl<IApplicant['gender']>;
  nationality: FormControl<IApplicant['nationality']>;
  nicNumber: FormControl<IApplicant['nicNumber']>;
  email: FormControl<IApplicant['email']>;
  mobileNumber: FormControl<IApplicant['mobileNumber']>;
  whatsappNumber: FormControl<IApplicant['whatsappNumber']>;
  contactAddress: FormControl<IApplicant['contactAddress']>;
  permanentAddress: FormControl<IApplicant['permanentAddress']>;
  district: FormControl<IApplicant['district']>;
  preferredCourseType: FormControl<IApplicant['preferredCourseType']>;
  financeType: FormControl<IApplicant['financeType']>;
  sponsorName: FormControl<IApplicant['sponsorName']>;
  declarationAccepted: FormControl<IApplicant['declarationAccepted']>;
  employment: FormControl<IApplicant['employment']>;
};

export type ApplicantFormGroup = FormGroup<ApplicantFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ApplicantFormService {
  createApplicantFormGroup(applicant: ApplicantFormGroupInput = { id: null }): ApplicantFormGroup {
    const applicantRawValue = {
      ...this.getFormDefaults(),
      ...applicant,
    };
    return new FormGroup<ApplicantFormGroupContent>({
      id: new FormControl(
        { value: applicantRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      fullName: new FormControl(applicantRawValue.fullName, {
        validators: [Validators.required],
      }),
      initialsName: new FormControl(applicantRawValue.initialsName),
      dateOfBirth: new FormControl(applicantRawValue.dateOfBirth),
      gender: new FormControl(applicantRawValue.gender),
      nationality: new FormControl(applicantRawValue.nationality),
      nicNumber: new FormControl(applicantRawValue.nicNumber),
      email: new FormControl(applicantRawValue.email),
      mobileNumber: new FormControl(applicantRawValue.mobileNumber),
      whatsappNumber: new FormControl(applicantRawValue.whatsappNumber),
      contactAddress: new FormControl(applicantRawValue.contactAddress),
      permanentAddress: new FormControl(applicantRawValue.permanentAddress),
      district: new FormControl(applicantRawValue.district),
      preferredCourseType: new FormControl(applicantRawValue.preferredCourseType),
      financeType: new FormControl(applicantRawValue.financeType),
      sponsorName: new FormControl(applicantRawValue.sponsorName),
      declarationAccepted: new FormControl(applicantRawValue.declarationAccepted, {
        validators: [Validators.required],
      }),
      employment: new FormControl(applicantRawValue.employment),
    });
  }

  getApplicant(form: ApplicantFormGroup): IApplicant | NewApplicant {
    return form.getRawValue() as IApplicant | NewApplicant;
  }

  resetForm(form: ApplicantFormGroup, applicant: ApplicantFormGroupInput): void {
    const applicantRawValue = { ...this.getFormDefaults(), ...applicant };
    form.reset(
      {
        ...applicantRawValue,
        id: { value: applicantRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ApplicantFormDefaults {
    return {
      id: null,
      declarationAccepted: false,
    };
  }
}
