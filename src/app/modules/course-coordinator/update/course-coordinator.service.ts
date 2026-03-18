import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICourseCoordinator, NewCourseCoordinator } from '../course-coordinator.model';



type CourseCoordinatorFormGroupInput = ICourseCoordinator | Partial<NewCourseCoordinator>;
type CourseCoordinatorFormRawValue = ICourseCoordinator;
export type CourseCoordinatorFormGroup = FormGroup<{
  id: FormControl<ICourseCoordinator['id'] | NewCourseCoordinator['id']>;
  
  fullName: FormControl<ICourseCoordinator['fullName']>;
  
  teleNo: FormControl<ICourseCoordinator['teleNo']>;
  
  email: FormControl<ICourseCoordinator['email']>;
  
  nic: FormControl<ICourseCoordinator['nic']>;
  
  isActive: FormControl<ICourseCoordinator['isActive']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseCoordinatorFormService {
  createCourseCoordinatorFormGroup(entity: CourseCoordinatorFormGroupInput = { id: null }): CourseCoordinatorFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      fullName: new FormControl(entity.fullName, Validators.required),
      
      teleNo: new FormControl(entity.teleNo, Validators.required),
      
      email: new FormControl(entity.email, Validators.required),
      
      nic: new FormControl(entity.nic, Validators.required),
      
      isActive: new FormControl(entity.isActive, Validators.required),
      
      
    });
    return form;
  }

  

  getCourseCoordinator(form: CourseCoordinatorFormGroup): ICourseCoordinator | NewCourseCoordinator {
    return form.getRawValue() as ICourseCoordinator | NewCourseCoordinator;
  }

  resetForm(form: CourseCoordinatorFormGroup, entity: CourseCoordinatorFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
