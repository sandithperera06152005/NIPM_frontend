// This is an EJS template that generates the reusable form component for an entity.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
import { CourseInstallmentService, ICourseInstallment } from '../update/course-installment.service';
import { CourseFormGroup, CourseFormService } from '../update/course-form.service';
import { CourseCoordinatorService } from '../../course-coordinator/service/course-coordinator.service';
import { ICourseCoordinator } from '../../course-coordinator/course-coordinator.model';
import { CourseRegFormService, ICourseRegForm } from '../../course-reg-form/service/course-reg-form.service';
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
  private readonly courseCoordinatorService = inject(CourseCoordinatorService);
  private readonly courseRegFormService = inject(CourseRegFormService);
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

  courseCoordinators: ICourseCoordinator[] = [];
  courseRegForms: ICourseRegForm[] = [];


  get installments(): FormArray {
    return this.form.get('installments') as FormArray;
  }

  get courseCoordinatorControl(): FormControl {
    return this.form.get('coordinator') as FormControl;
  }

  get courseRegFormControl(): FormControl {
    return this.form.get('courseregform') as FormControl;
  }

  get feeControl(): FormControl {
    return this.form.get('fee') as FormControl;
  }

  get noofInstallmentsControl(): FormControl {
    return this.form.get('noofInstallments') as FormControl;
  }

  ngOnInit(): void {
    this.initializeFormFromInputs();
    this.loadCourseCoordinators();
    this.loadCourseRegForms();

    this.noofInstallmentsControl.valueChanges.subscribe(() => this.generateInstallments(true));

    this.feeControl.valueChanges.subscribe(() => this.generateInstallments(true));

    this.installments.setValidators(this.installmentsTotalValidator());

    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized) return;

    if (changes['entity'] && changes['entity'].currentValue) {
      this.entity = changes['entity'].currentValue;
      this.initializeFormFromInputs();
    }
  }


  private loadCourseCoordinators(): void {
    this.courseCoordinatorService.query().subscribe({
      next: (response) => {
        const coordinators = response.body ?? [];
        this.courseCoordinators = coordinators.filter(c => c.isActive);
        if (this.entity?.coordinator) {
          const selected = this.courseCoordinators.find(c => c.id === this.entity!.coordinator!.id) ?? null;
          this.courseCoordinatorControl.setValue(selected);
        }
      },
      error: (err) => {
        console.error('Error loading course coordinators', err);
      }
    });
  }

  private loadCourseRegForms(): void {
    this.courseRegFormService.query().subscribe({
      next: (forms) => {
        this.courseRegForms = forms;
        if (this.entity?.courseregform) {
          const selected = this.courseRegForms.find(f => f.id === this.entity!.courseregform!.id) ?? null;
          this.courseRegFormControl.setValue(selected);
        }
      },
      error: (err) => {
        console.error('Error loading course reg forms', err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;

    const rawValue = this.formService.getCourse(this.form);
    const payload: ICourse | NewCourse = {
      ...rawValue,
      coordinator: rawValue.coordinator ? { id: rawValue.coordinator.id } : null,
      courseregform: rawValue.courseregform ? { id: rawValue.courseregform.id } : null
    };


    const courseRequest$ = payload.id
      ? this.courseService.update(payload as ICourse)
      : this.courseService.create(payload as NewCourse);

    courseRequest$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: response => {
        const savedCourse = response.body;
        if (!savedCourse?.id) {
          this.errorMessage = 'Error saving course: No ID returned.';
          return;
        }

        // Process installments
        const installmentRequests = this.installments.controls.map(instForm => {
          const instRaw = instForm.getRawValue();

          const installmentPayload: ICourseInstallment = {
            id: instRaw.id ?? undefined,
            installmentNo: instRaw.installmentNo,
            installmentFee: instRaw.installmentFee,
            dueDate: instRaw.dueDate
              ? new Date(instRaw.dueDate).toISOString().split('T')[0]
              : null,
            course: { id: savedCourse.id },
          };

          // Update if existing, create if new
          return instRaw.id
            ? this.courseInstallmentService.update(installmentPayload)
            : this.courseInstallmentService.create(installmentPayload);
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

  readonly compareEntityById = (
    option: { id?: number } | null,
    value: { id?: number } | null
  ): boolean => (option && value ? option.id === value.id : option === value);

  private initializeFormFromInputs(): void {
    if (!this.heading && this.dialogData?.heading) {
      this.heading = this.dialogData.heading;
    }
    const entity = this.entity ?? this.dialogData?.entity ?? null;
    const defaults = this.dialogData?.defaults ?? {};
    if (entity) {
      this.formService.resetForm(this.form, entity);
      this.feeControl.setValue(entity.fee ?? 0, { emitEvent: false });
      this.loadInstallmentsFromBackend(entity.id);

    } else {
      this.formService.resetForm(this.form, { id: null, ...defaults } as Partial<NewCourse>);
    }
  }

  private loadInstallmentsFromBackend(courseId: number): void {
    // Fetch all installments for the given course from backend
    this.courseInstallmentService.getByCourse(courseId).subscribe({
      next: (installments) => {
        // Clear current FormArray without emitting events
        this.installments.clear({ emitEvent: false });

        // Push each installment into the FormArray, including its ID
        installments.forEach(inst => {
          const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
          this.installments.push(
            this.formService.createInstallment(
              inst.installmentNo,
              inst.installmentFee,
              dueDate,
              inst.id // pass the backend ID so we can update instead of creating a new one
            )
          );
        });

        // Set the number of installments control for dynamic HTML generation
        this.noofInstallmentsControl.setValue(
          this.installments.length,
          { emitEvent: true } // emitEvent: true triggers the HTML form fields
        );

        // Trigger Angular to update validations and render
        this.installments.updateValueAndValidity({ emitEvent: true });
      },
      error: (err) => {
        console.error('Error fetching installments', err);
        this.errorMessage = 'Failed to load installments from backend';
      }
    });
  }
  private generateInstallments(userTriggered = false): void {
    const fee = this.feeControl.value ?? 0;
    const count = this.noofInstallmentsControl.value ?? 0;

    if (!fee || !count) {
      this.installments.clear({ emitEvent: false });
      return;
    }

    const oldValues = userTriggered
      ? this.installments.controls.map(ctrl => ({
        fee: ctrl.get('installmentFee')?.value ?? 0,
        dueDate: ctrl.get('dueDate')?.value ?? null
      }))
      : [];

    this.installments.clear({ emitEvent: false });
    const perInstallment = +(fee / count).toFixed(2);

    for (let i = 0; i < count; i++) {
      const feeValue = oldValues[i]?.fee ?? perInstallment;
      const dueDateValue = oldValues[i]?.dueDate ?? null;
      this.installments.push(this.formService.createInstallment(i + 1, feeValue, dueDateValue));
    }
    this.installments.updateValueAndValidity({ emitEvent: false });
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

      const total = arr.controls
        .map(c => c.get('installmentFee')?.value ?? 0)
        .reduce((a, b) => a + Number(b), 0);

      return Math.abs(total - fee) > 0.01 ? { totalMismatch: true } : null;
    };
  }

}



