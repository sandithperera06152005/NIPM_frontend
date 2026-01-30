import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMembership, NewMembership } from '../membership.model';



type MembershipFormGroupInput = IMembership | Partial<NewMembership>;
type MembershipFormRawValue = IMembership;
export type MembershipFormGroup = FormGroup<{
  id: FormControl<IMembership['id'] | NewMembership['id']>;
  
  membershipNumber: FormControl<IMembership['membershipNumber']>;
  
  startDate: FormControl<IMembership['startDate']>;
  
  endDate: FormControl<IMembership['endDate']>;
  
  status: FormControl<IMembership['status']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class MembershipFormService {
  createMembershipFormGroup(entity: MembershipFormGroupInput = { id: null }): MembershipFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      membershipNumber: new FormControl(entity.membershipNumber),
      
      startDate: new FormControl(entity.startDate),
      
      endDate: new FormControl(entity.endDate),
      
      status: new FormControl(entity.status),
      
      
    });
    return form;
  }

  getMembership(form: MembershipFormGroup): IMembership | NewMembership {
    return form.getRawValue() as IMembership | NewMembership;
  }

  resetForm(form: MembershipFormGroup, entity: MembershipFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
