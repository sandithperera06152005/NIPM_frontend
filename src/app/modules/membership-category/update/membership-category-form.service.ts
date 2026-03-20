import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMembershipCategory, NewMembershipCategory } from '../membership-category.model';



type MembershipCategoryFormGroupInput = IMembershipCategory | Partial<NewMembershipCategory>;
type MembershipCategoryFormRawValue = IMembershipCategory;
export type MembershipCategoryFormGroup = FormGroup<{
  id: FormControl<IMembershipCategory['id'] | NewMembershipCategory['id']>;

  membershipNumber: FormControl<IMembershipCategory['membershipNumber']>;

  membershipName: FormControl<IMembershipCategory['membershipName']>;

  startDate: FormControl<IMembershipCategory['startDate']>;

  endDate: FormControl<IMembershipCategory['endDate']>;

  duration: FormControl<IMembershipCategory['duration']>;

  price: FormControl<IMembershipCategory['price']>;

  status: FormControl<IMembershipCategory['status']>;


}>;

@Injectable({ providedIn: 'root' })
export class MembershipCategoryFormService {
  createMembershipCategoryFormGroup(entity: MembershipCategoryFormGroupInput = { id: null }): MembershipCategoryFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: entity.id !== null ? [Validators.required] : [] }
      ),

      membershipNumber: new FormControl(entity.membershipNumber),

      membershipName: new FormControl(entity.membershipName),

      startDate: new FormControl(entity.startDate),

      endDate: new FormControl(entity.endDate),

      duration: new FormControl(entity.duration),

      price: new FormControl(entity.price),

      status: new FormControl(entity.status),


    });
    return form;
  }

  getMembershipCategory(form: MembershipCategoryFormGroup): IMembershipCategory | NewMembershipCategory {
    const rawValue = form.getRawValue();
    return {
      ...rawValue,
      duration: rawValue.duration ? +rawValue.duration : null,
      price: rawValue.price ? +rawValue.price : null,
    } as IMembershipCategory | NewMembershipCategory;
  }

  resetForm(form: MembershipCategoryFormGroup, entity: MembershipCategoryFormGroupInput): void {
    form.reset({
      ...entity,

    } as any);
    form.controls.id.setValue(entity.id);
  }
}
