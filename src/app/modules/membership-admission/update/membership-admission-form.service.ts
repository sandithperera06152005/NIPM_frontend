import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMembershipAdmission, NewMembershipAdmission } from '../membership-admission.model';



type MembershipAdmissionFormGroupInput = IMembershipAdmission | Partial<NewMembershipAdmission>;
type MembershipAdmissionFormRawValue = IMembershipAdmission;
export type MembershipAdmissionFormGroup = FormGroup<{
  id: FormControl<IMembershipAdmission['id'] | NewMembershipAdmission['id']>;
  
  fullName: FormControl<IMembershipAdmission['fullName']>;
  
  nameWithInitials: FormControl<IMembershipAdmission['nameWithInitials']>;
  
  permanentAddress: FormControl<IMembershipAdmission['permanentAddress']>;
  
  teleNo: FormControl<IMembershipAdmission['teleNo']>;
  
  mobileNo: FormControl<IMembershipAdmission['mobileNo']>;
  
  whatsAppNo: FormControl<IMembershipAdmission['whatsAppNo']>;
  
  email: FormControl<IMembershipAdmission['email']>;
  
  nic: FormControl<IMembershipAdmission['nic']>;
  
  dateOfBirth: FormControl<IMembershipAdmission['dateOfBirth']>;
  
  memberOfCIP: FormControl<IMembershipAdmission['memberOfCIP']>;
  
  unsoundMind: FormControl<IMembershipAdmission['unsoundMind']>;
  
  insolventOrBankrupt: FormControl<IMembershipAdmission['insolventOrBankrupt']>;
  
  convictedByCourt: FormControl<IMembershipAdmission['convictedByCourt']>;
  
  referees1Name: FormControl<IMembershipAdmission['referees1Name']>;
  
  referees1Designation: FormControl<IMembershipAdmission['referees1Designation']>;
  
  referees1Address: FormControl<IMembershipAdmission['referees1Address']>;
  
  referees2Name: FormControl<IMembershipAdmission['referees2Name']>;
  
  referees2Designation: FormControl<IMembershipAdmission['referees2Designation']>;
  
  referees2Address: FormControl<IMembershipAdmission['referees2Address']>;
  
  status: FormControl<IMembershipAdmission['status']>;
  
  appliedDateTime: FormControl<IMembershipAdmission['appliedDateTime']>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class MembershipAdmissionFormService {
  createMembershipAdmissionFormGroup(entity: MembershipAdmissionFormGroupInput = { id: null }): MembershipAdmissionFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      fullName: new FormControl(entity.fullName),
      
      nameWithInitials: new FormControl(entity.nameWithInitials),
      
      permanentAddress: new FormControl(entity.permanentAddress),
      
      teleNo: new FormControl(entity.teleNo),
      
      mobileNo: new FormControl(entity.mobileNo),
      
      whatsAppNo: new FormControl(entity.whatsAppNo),
      
      email: new FormControl(entity.email),
      
      nic: new FormControl(entity.nic),
      
      dateOfBirth: new FormControl(entity.dateOfBirth),
      
      memberOfCIP: new FormControl(entity.memberOfCIP),
      
      unsoundMind: new FormControl(entity.unsoundMind),
      
      insolventOrBankrupt: new FormControl(entity.insolventOrBankrupt),
      
      convictedByCourt: new FormControl(entity.convictedByCourt),
      
      referees1Name: new FormControl(entity.referees1Name),
      
      referees1Designation: new FormControl(entity.referees1Designation),
      
      referees1Address: new FormControl(entity.referees1Address),
      
      referees2Name: new FormControl(entity.referees2Name),
      
      referees2Designation: new FormControl(entity.referees2Designation),
      
      referees2Address: new FormControl(entity.referees2Address),
      
      status: new FormControl(entity.status),
      
      appliedDateTime: new FormControl(entity.appliedDateTime),
      
      
    });
    return form;
  }

  getMembershipAdmission(form: MembershipAdmissionFormGroup): IMembershipAdmission | NewMembershipAdmission {
    return form.getRawValue() as IMembershipAdmission | NewMembershipAdmission;
  }

  resetForm(form: MembershipAdmissionFormGroup, entity: MembershipAdmissionFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
