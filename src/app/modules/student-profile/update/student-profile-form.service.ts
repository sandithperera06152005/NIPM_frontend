import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IStudentProfile, NewStudentProfile } from '../student-profile.model';



type StudentProfileFormGroupInput = IStudentProfile | Partial<NewStudentProfile>;
type StudentProfileFormRawValue = IStudentProfile;
export type StudentProfileFormGroup = FormGroup<{
  id: FormControl<IStudentProfile['id'] | NewStudentProfile['id']>;

  studentNumber: FormControl<IStudentProfile['studentNumber']>;

  studentName: FormControl<IStudentProfile['studentName']>;

  nic: FormControl<IStudentProfile['nic']>;

  dateOfBirth: FormControl<IStudentProfile['dateOfBirth']>;

  address: FormControl<IStudentProfile['address']>;

  enrollmentStatus: FormControl<IStudentProfile['enrollmentStatus']>;

  createdAt: FormControl<IStudentProfile['createdAt']>;


}>;

@Injectable({ providedIn: 'root' })
export class StudentProfileFormService {
  createStudentProfileFormGroup(entity: StudentProfileFormGroupInput = { id: null }): StudentProfileFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),

      studentNumber: new FormControl(entity.studentNumber),

      studentName: new FormControl(entity.studentName),

      nic: new FormControl(entity.nic),

      dateOfBirth: new FormControl(entity.dateOfBirth),

      address: new FormControl(entity.address),

      enrollmentStatus: new FormControl(entity.enrollmentStatus),

      createdAt: new FormControl(entity.createdAt),


    });
    return form;
  }

  getStudentProfile(form: StudentProfileFormGroup): IStudentProfile | NewStudentProfile {
    return form.getRawValue() as IStudentProfile | NewStudentProfile;
  }

  resetForm(form: StudentProfileFormGroup, entity: StudentProfileFormGroupInput): void {
    form.reset({
      ...entity,

    } as any);
    form.controls.id.setValue(entity.id);
  }
}
