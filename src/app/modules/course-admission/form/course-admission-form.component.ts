// This is an EJS template that generates the reusable form component for an entity.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Optional, Output, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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

  @Input() entity: ICourseAdmission | null = null;
  @Input() heading?: string;

  @Output() saved = new EventEmitter<ICourseAdmission>();
  @Output() cancelled = new EventEmitter<void>();

  form: CourseAdmissionFormGroup = this.formService.createCourseAdmissionFormGroup();
  isSaving = false;
  isInitialized = false;
  courses: ICourse[] = [];
  errorMessage: string | null = null;

  
  readonly applicationStatusOptions = Object.keys(ApplicationStatus);
  

  

  ngOnInit(): void {
    this.initializeFormFromInputs();
    this.loadRelationshipOptions();
    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized) {
      return;
    }
    if (changes['entity'] && changes['entity'].currentValue) {
      this.formService.resetForm(this.form, { ...(changes['entity'].currentValue as ICourseAdmission) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;

    const payload = this.formService.getCourseAdmission(this.form);


    //const payload = this.formService.getCourseAdmission(this.form);
    // Map form values to API model
    
    const isUpdate = payload.id !== null;
    const request$ = isUpdate
      ? this.courseAdmissionService.update(payload)
      :  this.courseAdmissionService.create(payload as NewCourseAdmission); 

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: response => {
        if (response.body) {
          this.saved.emit(response.body);
          this.dialogRef?.close(response.body);
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
  }

  private loadRelationshipOptions(): void {
  this.courseService.query().subscribe({
    next: (res) => {
      this.courses = res.body ?? [];

      // For edit mode: select the current course
      this.form.patchValue({
        courseRef: this.entity?.courseRef ?? null,   
        isSinglePayment: this.entity?.isSinglePayment ?? null,
      });
    }
  });
}
}
