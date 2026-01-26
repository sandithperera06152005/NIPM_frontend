import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICompany, NewCompany } from '../company.model';



type CompanyFormGroupInput = ICompany | Partial<NewCompany>;
type CompanyFormRawValue = ICompany;
export type CompanyFormGroup = FormGroup<{
  id: FormControl<ICompany['id'] | NewCompany['id']>;
  
  companyName: FormControl<ICompany['companyName']>;
  
  registrationNo: FormControl<ICompany['registrationNo']>;
  
  contactEmail: FormControl<ICompany['contactEmail']>;
  
  contactPhone: FormControl<ICompany['contactPhone']>;
  
  address: FormControl<ICompany['address']>;
  
  status: FormControl<ICompany['status']>;
  
  createdAt: FormControl<ICompany['createdAt']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CompanyFormService {
  createCompanyFormGroup(entity: CompanyFormGroupInput = { id: null }): CompanyFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      companyName: new FormControl(entity.companyName, Validators.required),
      
      registrationNo: new FormControl(entity.registrationNo),
      
      contactEmail: new FormControl(entity.contactEmail),
      
      contactPhone: new FormControl(entity.contactPhone),
      
      address: new FormControl(entity.address),
      
      status: new FormControl(entity.status),
      
      createdAt: new FormControl(entity.createdAt),
      
      
    });
    return form;
  }

  getCompany(form: CompanyFormGroup): ICompany | NewCompany {
    return form.getRawValue() as ICompany | NewCompany;
  }

  resetForm(form: CompanyFormGroup, entity: CompanyFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
