import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { ICourse, NewCourse } from '../course.model';

type CourseFormGroupInput = ICourse | Partial<NewCourse>;
type CourseFormRawValue = ICourse;
export type CourseFormGroup = FormGroup<{
  id: FormControl<ICourse['id'] | NewCourse['id']>;
  
  code: FormControl<ICourse['code']>;
  
  title: FormControl<ICourse['title']>;

  coordinator: FormControl<ICourse['coordinator']>;
  
  fee: FormControl<ICourse['fee']>;
  
  durationMonths: FormControl<ICourse['durationMonths']>;

  noofInstallments: FormControl<number>;
  
  active: FormControl<ICourse['active']>;

  installments: FormArray<FormGroup>;

  
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
      
      coordinator: new FormControl(null, Validators.required),

      fee: new FormControl(entity.fee, Validators.required),

      durationMonths: new FormControl(entity.durationMonths),

      noofInstallments: new FormControl((entity as any).noofInstallments ?? 0),
      
      active: new FormControl(entity.active),

      installments: new FormArray([]),

    });
    return form;
  }

  

  getCourse(form: CourseFormGroup): ICourse | NewCourse {
    //return form.getRawValue() as ICourse | NewCourse;
    const raw = form.getRawValue();

    const course: ICourse | NewCourse = {
      id: raw.id,
      code: raw.code,
      title: raw.title,
      coordinator: raw.coordinator,
      fee: raw.fee,
      durationMonths: raw.durationMonths,
      noofInstallments: raw.noofInstallments,
      active: raw.active,

      courseInstallments: raw.installments.map(inst => ({
        installmentNo: inst.installmentNo,
        installmentFee: inst.installmentFee,
        dueDate: inst.dueDate? new Date(inst.dueDate).toISOString(): null,
      })),
    };
    return course;
  }

  resetForm(form: CourseFormGroup, entity: CourseFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }

  /**
   * Create a FormGroup for a single installment
   * @param installmentNo number
   * @param installmentFee number
   * @param dueDate Date | null
   */
  createInstallment(installmentNo: number, installmentFee: number, dueDate: Date | null = null): FormGroup {
    return new FormGroup({
      installmentNo: new FormControl({ value: installmentNo, disabled: true }, { nonNullable: true }),
      installmentFee: new FormControl(installmentFee, { nonNullable: true, validators: [Validators.required] }),
      dueDate: new FormControl<Date | null>(dueDate),
    });
  }
}
