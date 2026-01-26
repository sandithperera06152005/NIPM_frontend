import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAcademicYear, NewAcademicYear } from '../academic-year.model';



type AcademicYearFormGroupInput = IAcademicYear | Partial<NewAcademicYear>;
type AcademicYearFormRawValue = IAcademicYear;
export type AcademicYearFormGroup = FormGroup<{
  id: FormControl<IAcademicYear['id'] | NewAcademicYear['id']>;
  
  yearLabel: FormControl<IAcademicYear['yearLabel']>;
  
  startDate: FormControl<IAcademicYear['startDate']>;
  
  endDate: FormControl<IAcademicYear['endDate']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class AcademicYearFormService {
  createAcademicYearFormGroup(entity: AcademicYearFormGroupInput = { id: null }): AcademicYearFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      yearLabel: new FormControl(entity.yearLabel, Validators.required),
      
      startDate: new FormControl(entity.startDate),
      
      endDate: new FormControl(entity.endDate),
      
      
    });
    return form;
  }

  getAcademicYear(form: AcademicYearFormGroup): IAcademicYear | NewAcademicYear {
    return form.getRawValue() as IAcademicYear | NewAcademicYear;
  }

  resetForm(form: AcademicYearFormGroup, entity: AcademicYearFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
