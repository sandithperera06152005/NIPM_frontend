import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAppUser, NewAppUser } from '../app-user.model';



type AppUserFormGroupInput = IAppUser | Partial<NewAppUser>;
type AppUserFormRawValue = IAppUser;
export type AppUserFormGroup = FormGroup<{
  id: FormControl<IAppUser['id'] | NewAppUser['id']>;
  
  username: FormControl<IAppUser['username']>;
  
  email: FormControl<IAppUser['email']>;
  
  passwordHash: FormControl<IAppUser['passwordHash']>;
  
  firstName: FormControl<IAppUser['firstName']>;
  
  lastName: FormControl<IAppUser['lastName']>;
  
  phone: FormControl<IAppUser['phone']>;
  
  status: FormControl<IAppUser['status']>;
  
  createdAt: FormControl<IAppUser['createdAt']>;
  
  updatedAt: FormControl<IAppUser['updatedAt']>;
  
  lastLoginAt: FormControl<IAppUser['lastLoginAt']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class AppUserFormService {
  createAppUserFormGroup(entity: AppUserFormGroupInput = { id: null }): AppUserFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      username: new FormControl(entity.username, Validators.required),
      
      email: new FormControl(entity.email, Validators.required),
      
      passwordHash: new FormControl(entity.passwordHash, Validators.required),
      
      firstName: new FormControl(entity.firstName),
      
      lastName: new FormControl(entity.lastName),
      
      phone: new FormControl(entity.phone),
      
      status: new FormControl(entity.status, Validators.required),
      
      createdAt: new FormControl(entity.createdAt),
      
      updatedAt: new FormControl(entity.updatedAt),
      
      lastLoginAt: new FormControl(entity.lastLoginAt),
      
      
    });
    return form;
  }

  getAppUser(form: AppUserFormGroup): IAppUser | NewAppUser {
    return form.getRawValue() as IAppUser | NewAppUser;
  }

  resetForm(form: AppUserFormGroup, entity: AppUserFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
