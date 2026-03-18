import { Injectable } from '@angular/core';
import { FormControl, FormGroup,FormArray,Validators } from '@angular/forms';
import { ICourseAdmission, NewCourseAdmission } from '../course-admission.model';
import { ICourse } from '../../course/course.model';
import { AbstractControl, ValidationErrors } from '@angular/forms';

type CourseAdmissionFormGroupInput = ICourseAdmission | Partial<NewCourseAdmission>;
type CourseAdmissionFormRawValue = ICourseAdmission;
export type CourseAdmissionFormGroup = FormGroup<{
  id: FormControl<ICourseAdmission['id'] | NewCourseAdmission['id']>;
  
  fullName: FormControl<ICourseAdmission['fullName']>;
  
  nameWithInitials: FormControl<ICourseAdmission['nameWithInitials']>;
  
  permanentAddress: FormControl<ICourseAdmission['permanentAddress']>;
  
  teleNo: FormControl<ICourseAdmission['teleNo']>;
  
  mobileNo: FormControl<ICourseAdmission['mobileNo']>;
  
  whatsAppNo: FormControl<ICourseAdmission['whatsAppNo']>;
  
  email: FormControl<ICourseAdmission['email']>;
  
  nic: FormControl<ICourseAdmission['nic']>;
  
  dateOfBirth: FormControl<ICourseAdmission['dateOfBirth']>;
  
  employer: FormControl<ICourseAdmission['employer']>;
  
  employerDesignation: FormControl<ICourseAdmission['employerDesignation']>;
  
  employerOfficialAddress: FormControl<ICourseAdmission['employerOfficialAddress']>;
  
  employerTeleNo: FormControl<ICourseAdmission['employerTeleNo']>;
  
  employerFaxNo: FormControl<ICourseAdmission['employerFaxNo']>;
  
  sponsorByWhom: FormControl<ICourseAdmission['sponsorByWhom']>;
  
  advertisementTypeOther: FormControl<ICourseAdmission['advertisementTypeOther']>;
  
  status: FormControl<ICourseAdmission['status']>;
  
  appliedDateTime: FormControl<ICourseAdmission['appliedDateTime']>;
  
  approval1Status: FormControl<ICourseAdmission['approval1Status']>;
  
  approval1DateTime: FormControl<ICourseAdmission['approval1DateTime']>;
  
  approval2Status: FormControl<ICourseAdmission['approval2Status']>;
  
  approval2DateTime: FormControl<ICourseAdmission['approval2DateTime']>;
  
  approval3Status: FormControl<ICourseAdmission['approval3Status']>;
  
  approval3DateTime: FormControl<ICourseAdmission['approval3DateTime']>;

  courseRef: FormControl<ICourse  | null>; 

  isSinglePayment: FormControl<boolean | null>;

  installments: FormArray<FormGroup>; 
  
}>;

@Injectable({ providedIn: 'root' })
export class CourseAdmissionFormService {
  createCourseAdmissionFormGroup(entity: CourseAdmissionFormGroupInput = { id: null }): CourseAdmissionFormGroup {
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
      
      employer: new FormControl(entity.employer),
      
      employerDesignation: new FormControl(entity.employerDesignation),
      
      employerOfficialAddress: new FormControl(entity.employerOfficialAddress),
      
      employerTeleNo: new FormControl(entity.employerTeleNo),
      
      employerFaxNo: new FormControl(entity.employerFaxNo),
      
      sponsorByWhom: new FormControl(entity.sponsorByWhom),
      
      advertisementTypeOther: new FormControl(entity.advertisementTypeOther),
      
      status: new FormControl(entity.status),
      
      appliedDateTime: new FormControl(entity.appliedDateTime),
      
      approval1Status: new FormControl(entity.approval1Status),
      
      approval1DateTime: new FormControl(entity.approval1DateTime),
      
      approval2Status: new FormControl(entity.approval2Status),
      
      approval2DateTime: new FormControl(entity.approval2DateTime),
      
      approval3Status: new FormControl(entity.approval3Status),
      
      approval3DateTime: new FormControl(entity.approval3DateTime),

      courseRef: new FormControl(null, Validators.required),
      
      isSinglePayment: new FormControl(entity.isSinglePayment ?? null),
      
      installments: new FormArray([]),
    });
    return form;
  }

  createInstallmentFormGroup(no: number, fee: number, dueDate:String): FormGroup {
    return new FormGroup({
      installmentNo: new FormControl(no, Validators.required),
      installmentFee: new FormControl(fee, [Validators.required, Validators.min(1)]),
      dueDate: new FormControl(dueDate,Validators.required), 
    });
  }

  getCourseAdmission(form: CourseAdmissionFormGroup): ICourseAdmission | NewCourseAdmission {
    const raw = form.getRawValue();
    return {
      ...raw,
      courseRefId: raw.courseRef?.id ?? null,
      courseRef: undefined,
      isSinglePayment: raw.isSinglePayment ?? null,
      installments: raw.installments.map(inst => ({
        installmentNo: inst.installmentNo,
        installmentFee: inst.installmentFee,
        dueDate:inst.dueDate,
      })),
    } as unknown as ICourseAdmission | NewCourseAdmission;
  }

  resetForm(form: CourseAdmissionFormGroup, entity: CourseAdmissionFormGroupInput): void {
    form.reset({
      ...entity,
      courseRef: entity.courseRef ?? null,
      isSinglePayment: entity.isSinglePayment ?? false,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }

  static totalInstallmentsValidator(expectedTotal: number) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formArray = control as FormArray;
      const total = formArray.controls.reduce((sum, group) => {
        return sum + (group.get('installmentFee')?.value ?? 0);
      }, 0);
      return total !== expectedTotal ? { totalMismatch: true } : null;
    };
  }
}
