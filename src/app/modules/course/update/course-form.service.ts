import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourse, NewCourse } from '../course.model';



type CourseFormGroupInput = ICourse | Partial<NewCourse>;
type CourseFormRawValue = ICourse;
export type CourseFormGroup = FormGroup<{
  id: FormControl<ICourse['id'] | NewCourse['id']>;
  
  code: FormControl<ICourse['code']>;
  
  title: FormControl<ICourse['title']>;
  
  fee: FormControl<ICourse['fee']>;
  
  durationMonths: FormControl<ICourse['durationMonths']>;
  
  active: FormControl<ICourse['active']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseFormService {
  createCourseFormGroup(entity: CourseFormGroupInput = { id: null }): CourseFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      code: new FormControl(entity.code),
      
      title: new FormControl(entity.title, Validators.required),
      
      fee: new FormControl(entity.fee, Validators.required),
      
      durationMonths: new FormControl(entity.durationMonths),
      
      active: new FormControl(entity.active),
      
      
    });
    return form;
  }

  getCourse(form: CourseFormGroup): ICourse | NewCourse {
    return form.getRawValue() as ICourse | NewCourse;
  }

  resetForm(form: CourseFormGroup, entity: CourseFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
