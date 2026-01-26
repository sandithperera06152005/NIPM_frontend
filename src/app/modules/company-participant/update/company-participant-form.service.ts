import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ICompanyParticipant, NewCompanyParticipant } from '../company-participant.model';



type CompanyParticipantFormGroupInput = ICompanyParticipant | Partial<NewCompanyParticipant>;
type CompanyParticipantFormRawValue = ICompanyParticipant;
export type CompanyParticipantFormGroup = FormGroup<{
  id: FormControl<ICompanyParticipant['id'] | NewCompanyParticipant['id']>;
  
  joinedAt: FormControl<ICompanyParticipant['joinedAt']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class CompanyParticipantFormService {
  createCompanyParticipantFormGroup(entity: CompanyParticipantFormGroupInput = { id: null }): CompanyParticipantFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      joinedAt: new FormControl(entity.joinedAt),
      
      
    });
    return form;
  }

  getCompanyParticipant(form: CompanyParticipantFormGroup): ICompanyParticipant | NewCompanyParticipant {
    return form.getRawValue() as ICompanyParticipant | NewCompanyParticipant;
  }

  resetForm(form: CompanyParticipantFormGroup, entity: CompanyParticipantFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
