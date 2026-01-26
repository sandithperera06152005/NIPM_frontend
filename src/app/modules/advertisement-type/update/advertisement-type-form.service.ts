import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAdvertisementType, NewAdvertisementType } from '../advertisement-type.model';



type AdvertisementTypeFormGroupInput = IAdvertisementType | Partial<NewAdvertisementType>;
type AdvertisementTypeFormRawValue = IAdvertisementType;
export type AdvertisementTypeFormGroup = FormGroup<{
  id: FormControl<IAdvertisementType['id'] | NewAdvertisementType['id']>;
  
  name: FormControl<IAdvertisementType['name']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class AdvertisementTypeFormService {
  createAdvertisementTypeFormGroup(entity: AdvertisementTypeFormGroupInput = { id: null }): AdvertisementTypeFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      name: new FormControl(entity.name),
      
      
    });
    return form;
  }

  getAdvertisementType(form: AdvertisementTypeFormGroup): IAdvertisementType | NewAdvertisementType {
    return form.getRawValue() as IAdvertisementType | NewAdvertisementType;
  }

  resetForm(form: AdvertisementTypeFormGroup, entity: AdvertisementTypeFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
