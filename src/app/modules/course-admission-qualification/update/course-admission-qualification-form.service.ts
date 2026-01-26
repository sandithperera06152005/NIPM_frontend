import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourseAdmissionQualification, NewCourseAdmissionQualification } from '../course-admission-qualification.model';



type CourseAdmissionQualificationFormGroupInput = ICourseAdmissionQualification | Partial<NewCourseAdmissionQualification>;
type CourseAdmissionQualificationFormRawValue = ICourseAdmissionQualification;
export type CourseAdmissionQualificationFormGroup = FormGroup<{
  id: FormControl<ICourseAdmissionQualification['id'] | NewCourseAdmissionQualification['id']>;
  
  subjectName: FormControl<ICourseAdmissionQualification['subjectName']>;
  
  grade: FormControl<ICourseAdmissionQualification['grade']>;
  
  year: FormControl<ICourseAdmissionQualification['year']>;
  
  level: FormControl<ICourseAdmissionQualification['level']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseAdmissionQualificationFormService {
  createCourseAdmissionQualificationFormGroup(entity: CourseAdmissionQualificationFormGroupInput = { id: null }): CourseAdmissionQualificationFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      subjectName: new FormControl(entity.subjectName),
      
      grade: new FormControl(entity.grade),
      
      year: new FormControl(entity.year),
      
      level: new FormControl(entity.level),
      
      
    });
    return form;
  }

  getCourseAdmissionQualification(form: CourseAdmissionQualificationFormGroup): ICourseAdmissionQualification | NewCourseAdmissionQualification {
    return form.getRawValue() as ICourseAdmissionQualification | NewCourseAdmissionQualification;
  }

  resetForm(form: CourseAdmissionQualificationFormGroup, entity: CourseAdmissionQualificationFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
