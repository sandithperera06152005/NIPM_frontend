// This is an EJS template that generates the reusable form component for an entity.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormArray,FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
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
import { finalize } from 'rxjs/operators';
import { ICourse, NewCourse } from '../course.model';
import { CourseService } from '../service/course.service';
import { CourseInstallmentService,ICourseInstallment } from '../update/course-installment.service';
import { CourseFormGroup, CourseFormService } from '../update/course-form.service';
import { forkJoin } from 'rxjs';


type CourseFormDialogData = {
  entity?: ICourse;
  defaults?: Partial<NewCourse>;
  heading?: string;
};

@Component({
  selector: 'app-course-form',
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
  ],
  templateUrl: './course-form.component.html',
})
export class CourseFormComponent implements OnInit, OnChanges {
  private readonly courseService = inject(CourseService);
  private readonly courseInstallmentService = inject(CourseInstallmentService);
  private readonly formService = inject(CourseFormService);
  private readonly dialogRef = inject(MatDialogRef<CourseFormComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as CourseFormDialogData | null;

  @Input() entity: ICourse | null = null;
  @Input() heading?: string;

  @Output() saved = new EventEmitter<ICourse>();
  @Output() cancelled = new EventEmitter<void>();

  form: CourseFormGroup = this.formService.createCourseFormGroup();
  
  isSaving = false;
  isInitialized = false;
  
  errorMessage: string | null = null;
  
  // Access to FormArray and controls
  get installments(): FormArray {
    return this.form.get('installments') as FormArray;
  }

  get feeControl(): FormControl {
    return this.form.get('fee') as FormControl;
  }

  get noofInstallmentsControl(): FormControl {
    return this.form.get('noofInstallments') as FormControl;
  }

  ngOnInit(): void {
    this.initializeFormFromInputs();
    this.loadRelationshipOptions();

    // Regenerate installments when fee or number changes
    this.noofInstallmentsControl.valueChanges.subscribe(() => this.generateInstallments());
    this.feeControl.valueChanges.subscribe(() => this.generateInstallments());

    // Set validator for total installments
    this.installments.setValidators(this.installmentsTotalValidator());

    // Revalidate whenever fee or installment values change
    this.feeControl.valueChanges.subscribe(() => this.installments.updateValueAndValidity());
    this.installments.valueChanges.subscribe(() => this.installments.updateValueAndValidity());

    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (!this.isInitialized) return;

      if (changes['entity'] && changes['entity'].currentValue) {
        this.formService.resetForm(this.form, changes['entity'].currentValue as ICourse);
        this.loadInstallmentsFromEntity(changes['entity'].currentValue);
      }
    }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;

    const payload = this.formService.getCourse(this.form);
    const isUpdate = !!payload.id;

    const courseRequest$ = isUpdate
      ? this.courseService.update(payload as ICourse)
      : this.courseService.create(payload as NewCourse);

    courseRequest$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: response => {
        const savedCourse = response.body;
        if (!savedCourse || !savedCourse.id) {
          this.errorMessage = 'Error saving course: No ID returned.';
          return;
        }

        // Save installments after the course is saved
        const installmentRequests = this.installments.controls.map(instForm => {
          const instRaw = instForm.getRawValue();
          const installmentPayload: ICourseInstallment = {
            installmentNo: instRaw.installmentNo,
            installmentFee: instRaw.installmentFee,
            course: { id: savedCourse.id },
          };
          return this.courseInstallmentService.create(installmentPayload);
        });

        if (installmentRequests.length > 0) {
          forkJoin(installmentRequests).subscribe({
            next: () => {
              this.saved.emit(savedCourse);
              this.dialogRef?.close(savedCourse);
            },
            error: () => {
              this.errorMessage = 'Course saved, but failed to save installments.';
            },
          });
        } else {
          this.saved.emit(savedCourse);
          this.dialogRef?.close(savedCourse);
        }
      },
      error: () => {
        this.errorMessage = 'Unable to save course. Please try again.';
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
      // Load installments from entity
      this.loadInstallmentsFromEntity(entity);
    } else {
      this.formService.resetForm(this.form, { id: null, ...defaults } as Partial<NewCourse>);
    }
  }

  private loadRelationshipOptions(): void {
    
  }

  // Installments methods
  private generateInstallments(): void {
    const fee = this.feeControl.value ?? 0;
    const count = this.noofInstallmentsControl.value ?? 0;

    this.installments.clear();
    if (!fee || !count) return;

    const perInstallment = +(fee / count).toFixed(2);
    for (let i = 1; i <= count; i++) {
      this.installments.push(this.formService.createInstallment(i, perInstallment));
    }
  }

  private loadInstallmentsFromEntity(course: ICourse): void {
    const installments = course.courseInstallments ?? [];
    this.installments.clear();
    installments.forEach(inst => {
      this.installments.push(this.formService.createInstallment(inst.installmentNo, inst.installmentFee));
    });
  }

  //Validate that sum of installments equals total fee
  private installmentsTotalValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    const fee = this.feeControl.value ?? 0;

    // If no installments, skip validation
    if (!arr || arr.length === 0) {
      return null;
    }

    const values = arr.controls.map(c => c.get('installmentFee')?.value ?? 0);

    // Sum of installment fees
    const total = values.reduce((sum, val) => sum + Number(val), 0);

    // Use a small epsilon to avoid floating point errors
    const epsilon = 0.01;

    // If total differs from fee more than epsilon, set error
    return Math.abs(total - fee) > epsilon ? { totalMismatch: true } : null;
  };
  }

}



