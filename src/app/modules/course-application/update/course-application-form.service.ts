import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourseApplication, NewCourseApplication } from '../course-application.model';



type CourseApplicationFormGroupInput = ICourseApplication | Partial<NewCourseApplication>;
type CourseApplicationFormRawValue = ICourseApplication;
export type CourseApplicationFormGroup = FormGroup<{
  id: FormControl<ICourseApplication['id'] | NewCourseApplication['id']>;
  
  applicationDate: FormControl<ICourseApplication['applicationDate']>;
  
  status: FormControl<ICourseApplication['status']>;
  
  remarks: FormControl<ICourseApplication['remarks']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseApplicationFormService {
  createCourseApplicationFormGroup(entity: CourseApplicationFormGroupInput = { id: null }): CourseApplicationFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      applicationDate: new FormControl(entity.applicationDate),
      
      status: new FormControl(entity.status),
      
      remarks: new FormControl(entity.remarks),
      
      
    });
    return form;
  }

  getCourseApplication(form: CourseApplicationFormGroup): ICourseApplication | NewCourseApplication {
    return form.getRawValue() as ICourseApplication | NewCourseApplication;
  }

  resetForm(form: CourseApplicationFormGroup, entity: CourseApplicationFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
