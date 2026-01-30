import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMembershipApplication, NewMembershipApplication } from '../membership-application.model';



type MembershipApplicationFormGroupInput = IMembershipApplication | Partial<NewMembershipApplication>;
type MembershipApplicationFormRawValue = IMembershipApplication;
export type MembershipApplicationFormGroup = FormGroup<{
  id: FormControl<IMembershipApplication['id'] | NewMembershipApplication['id']>;
  
  applicationDate: FormControl<IMembershipApplication['applicationDate']>;
  
  status: FormControl<IMembershipApplication['status']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class MembershipApplicationFormService {
  createMembershipApplicationFormGroup(entity: MembershipApplicationFormGroupInput = { id: null }): MembershipApplicationFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      applicationDate: new FormControl(entity.applicationDate),
      
      status: new FormControl(entity.status),
      
      
    });
    return form;
  }

  getMembershipApplication(form: MembershipApplicationFormGroup): IMembershipApplication | NewMembershipApplication {
    return form.getRawValue() as IMembershipApplication | NewMembershipApplication;
  }

  resetForm(form: MembershipApplicationFormGroup, entity: MembershipApplicationFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
