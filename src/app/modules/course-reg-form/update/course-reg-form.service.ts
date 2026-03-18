import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourseRegForm, NewCourseRegForm } from '../course-reg-form.model';



type CourseRegFormFormGroupInput = ICourseRegForm | Partial<NewCourseRegForm>;
type CourseRegFormFormRawValue = ICourseRegForm;
export type CourseRegFormFormGroup = FormGroup<{
  id: FormControl<ICourseRegForm['id'] | NewCourseRegForm['id']>;
  
  formName: FormControl<ICourseRegForm['formName']>;
  
  fileUploadPath: FormControl<ICourseRegForm['fileUploadPath']>;
  
  formPath: FormControl<ICourseRegForm['formPath']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseRegFormFormService {
  createCourseRegFormFormGroup(entity: CourseRegFormFormGroupInput = { id: null }): CourseRegFormFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      formName: new FormControl(entity.formName, Validators.required),
      
      fileUploadPath: new FormControl(entity.fileUploadPath, Validators.required),
      
      formPath: new FormControl(entity.formPath),
      
      
    });
    return form;
  }

  getCourseRegForm(form: CourseRegFormFormGroup): ICourseRegForm | NewCourseRegForm {
    return form.getRawValue() as ICourseRegForm | NewCourseRegForm;
  }

  resetForm(form: CourseRegFormFormGroup, entity: CourseRegFormFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
