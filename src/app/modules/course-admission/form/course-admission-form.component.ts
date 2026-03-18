// This is an EJS template that generates the reusable form component for an entity.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Optional, Output, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormArray, FormGroup,ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { finalize } from 'rxjs/operators';

import { ICourseAdmission, NewCourseAdmission } from '../course-admission.model';
import { CourseAdmissionService } from '../service/course-admission.service';
import { CourseAdmissionFormGroup, CourseAdmissionFormService } from '../update/course-admission-form.service';

import { ICourse } from '../../course/course.model';
import { CourseService } from '../../course/service/course.service';
import { CourseInstallmentService, ICourseInstallment } from '../../course/update/course-installment.service';
import { CourseAdmissionInvoiceService,CourseAdmissionInvoice } from '../update/course-admission-invoice.service';

import { ApplicationStatus } from '../../../enums/application-status.model';

type CourseAdmissionFormDialogData = {
  entity?: ICourseAdmission;
  defaults?: Partial<NewCourseAdmission>;
  heading?: string;
};

@Component({
  selector: 'app-course-admission-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatRadioModule,
  ],
  templateUrl: './course-admission-form.component.html',
})
export class CourseAdmissionFormComponent implements OnInit, OnChanges {
  private readonly courseAdmissionService = inject(CourseAdmissionService);
  private readonly formService = inject(CourseAdmissionFormService);
  private readonly courseService = inject(CourseService);
  private readonly dialogRef = inject(MatDialogRef<CourseAdmissionFormComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as CourseAdmissionFormDialogData | null;
  private readonly installmentService = inject(CourseInstallmentService);
  private readonly invoiceService = inject(CourseAdmissionInvoiceService);


  @Input() entity: ICourseAdmission | null = null;
  @Input() heading?: string;

  @Output() saved = new EventEmitter<ICourseAdmission>();
  @Output() cancelled = new EventEmitter<void>();

  form: CourseAdmissionFormGroup = this.formService.createCourseAdmissionFormGroup();
  isSaving = false;
  isInitialized = false;
  submitted = false;
  courses: ICourse[] = [];
  errorMessage: string | null = null;
  courseFee = 0;
  courseDurationMonths = 0;
  allInstallments: ICourseInstallment[] = [];

  get installments(): FormArray {
    return this.form.get('installments') as FormArray;
  }

  
  readonly applicationStatusOptions = Object.keys(ApplicationStatus);
  


  ngOnInit(): void {
    this.initializeFormFromInputs();
    this.loadRelationshipOptions();
    this.isInitialized = true;

    this.form.get('fullName')?.setValidators([Validators.required]);
    this.form.get('isSinglePayment')?.setValidators([Validators.required]);

    // Make Angular recalc validation status
    this.form.get('fullName')?.updateValueAndValidity();
    this.form.get('isSinglePayment')?.updateValueAndValidity();

    this.form.get('email')?.setValidators([Validators.required, Validators.email]);
    this.form.get('nic')?.setValidators([Validators.required, Validators.pattern(/^(\d{9}[vV]|\d{12})$/)]);
    
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('nic')?.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized) {
      return;
    }
    if (changes['entity']?.currentValue) {
      this.formService.resetForm(this.form, changes['entity'].currentValue);
    }
  }

  onCourseChange(): void {
    this.loadCourseInstallments();
  }

  onPaymentPlanChange(): void {
    this.updateInstallmentsForSelectedPlan();
  }

  private updateCourseMeta(): void {
    const selectedCourse = this.form.get('courseRef')?.value;

    this.courseFee = selectedCourse?.fee ?? 0;
    this.courseDurationMonths = selectedCourse?.durationMonths ?? 0;
  }

  private loadCourseInstallments(): void {
    this.installments.clear();
    this.allInstallments = [];
    const selectedCourse = this.form.get('courseRef')?.value;
    if (!selectedCourse?.id) return;


    this.form.get('isSinglePayment')?.setValue(null);

    this.installmentService.getByCourse(selectedCourse.id).subscribe({
      next: (installments: ICourseInstallment[]) => {
        this.allInstallments = installments;
      },
      error: () => {
        this.errorMessage = 'Failed to load installments for this course.';
      },
    });

    this.updateCourseMeta();
  }

  private updateInstallmentsForSelectedPlan(): void {
    this.installments.clear();
    const isSingle = this.form.get('isSinglePayment')?.value;
    if (!this.allInstallments.length) return;

    if (isSingle === true) {
      // Single payment
      const totalFee = this.allInstallments.length === 1
        ? this.allInstallments[0].installmentFee
        : this.allInstallments.reduce((sum, inst) => sum + inst.installmentFee, 0);

      this.installments.push(this.formService.createInstallmentFormGroup(1, totalFee,this.allInstallments[0].dueDate));
    } else if (isSingle === false) {
      // Multiple installments
      this.allInstallments
        .sort((a, b) => a.installmentNo - b.installmentNo)
        .forEach(inst => this.installments.push(this.formService.createInstallmentFormGroup(inst.installmentNo, inst.installmentFee,inst.dueDate)));
    }

    this.installments.setValidators(
      CourseAdmissionFormService.totalInstallmentsValidator(this.courseFee)
    );

    this.installments.controls.forEach((group: FormGroup) => {
      group.get('installmentFee')?.valueChanges.subscribe(() => {
        this.installments.updateValueAndValidity({ onlySelf: true });
      });
    });

    this.installments.updateValueAndValidity();
  }

  private async saveInstallments(courseAdmissionId: number): Promise<void> {
  if (!this.installments.length) return;

  const now = new Date().toISOString();

  for (const group of this.installments.controls) {
    const invoice: CourseAdmissionInvoice = {
      invoiceNo: `INV-${courseAdmissionId}-${group.value.installmentNo}`, 
      issuedDate: now,
      dueDate: group.value.dueDate ? new Date(group.value.dueDate).toISOString() : now,
      totalAmount: group.value.installmentFee,
      paidAmount: 0,
      courseAdmission: { id: courseAdmissionId }
    };

  
    await this.invoiceService.create(invoice).toPromise();
  }
}

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.invalid) {
    return; 
  }


  this.errorMessage = null;
  this.isSaving = true;

  const payload = this.formService.getCourseAdmission(this.form);

  const isUpdate = payload.id !== null;

  const request$ = isUpdate
    ? this.courseAdmissionService.update(payload)
    : this.courseAdmissionService.create(payload as NewCourseAdmission);

  request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
    next: async response => {
      if (response.body) {
        try {
          const admissionId = response.body.id;

          await this.saveInstallments(admissionId);

          this.courseAdmissionService.sendInvoiceEmail(admissionId).subscribe(emailRes => {
            if (emailRes.emailSent) {
              alert('Course Admission saved and invoice email sent!');
            } else {
              alert('Course Admission saved, but email failed.\n\nError: ' + (emailRes.error ?? 'Unknown error'));
            }
          });
          this.saved.emit(response.body);
          this.dialogRef?.close(response.body);

        } catch (error) {
          this.errorMessage = 'Course Admission saved, but failed to save invoices.';
        }
      }
    },
    error: () => {
      this.errorMessage = 'Unable to save record. Please try again.';
    },
  });
}

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close();
  }

  get isEditMode(): boolean {
    return !!this.form.controls.id.value;
  }

  readonly compareEntityById = (option: { id?: number } | null, value: { id?: number } | null): boolean =>
    option && value ? option.id === value.id : option === value;

 

  private initializeFormFromInputs(): void {
    if (!this.heading && this.dialogData?.heading) {
      this.heading = this.dialogData.heading;
    }
    const entity = this.entity ?? this.dialogData?.entity ?? null;
    const defaults = this.dialogData?.defaults ?? {};
    if (entity) {
      this.formService.resetForm(this.form, entity);
    } else {
      this.formService.resetForm(this.form, { id: null, ...defaults } as Partial<NewCourseAdmission>);
    }
     this.updateCourseMeta();
  }

private loadRelationshipOptions(): void {
    this.courseService.query({ page: 0, size: 500 }).subscribe({
      next: (res) => {
        this.courses = (res.body ?? []).filter(c => c.active);
        this.form.patchValue({
          courseRef: this.entity?.courseRef ?? null,   
          isSinglePayment: this.entity?.isSinglePayment ?? null,
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load data relationships. Please try again.';
      },       
    });
  
}
}




