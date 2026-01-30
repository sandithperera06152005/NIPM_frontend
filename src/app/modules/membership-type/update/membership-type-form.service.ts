import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMembershipType, NewMembershipType } from '../membership-type.model';



type MembershipTypeFormGroupInput = IMembershipType | Partial<NewMembershipType>;
type MembershipTypeFormRawValue = IMembershipType;
export type MembershipTypeFormGroup = FormGroup<{
  id: FormControl<IMembershipType['id'] | NewMembershipType['id']>;
  
  name: FormControl<IMembershipType['name']>;
  
  fee: FormControl<IMembershipType['fee']>;
  
  validityMonths: FormControl<IMembershipType['validityMonths']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class MembershipTypeFormService {
  createMembershipTypeFormGroup(entity: MembershipTypeFormGroupInput = { id: null }): MembershipTypeFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      name: new FormControl(entity.name, Validators.required),
      
      fee: new FormControl(entity.fee, Validators.required),
      
      validityMonths: new FormControl(entity.validityMonths),
      
      
    });
    return form;
  }

  getMembershipType(form: MembershipTypeFormGroup): IMembershipType | NewMembershipType {
    return form.getRawValue() as IMembershipType | NewMembershipType;
  }

  resetForm(form: MembershipTypeFormGroup, entity: MembershipTypeFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
