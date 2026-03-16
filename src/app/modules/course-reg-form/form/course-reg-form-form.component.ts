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
import { finalize } from 'rxjs/operators';

import { ICourseRegForm, NewCourseRegForm } from '../course-reg-form.model';
import { CourseRegFormService } from '../service/course-reg-form.service';
import { CourseRegFormFormGroup, CourseRegFormFormService } from '../update/course-reg-form.service';


type CourseRegFormFormDialogData = {
  entity?: ICourseRegForm;
  defaults?: Partial<NewCourseRegForm>;
  heading?: string;
};

@Component({
  selector: 'app-course-reg-form-form',
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
    CourseRegFormFormComponent,
  ],
  templateUrl: './course-reg-form-form.component.html',
})
export class CourseRegFormFormComponent implements OnInit, OnChanges {
  private readonly courseRegFormService = inject(CourseRegFormService);
  private readonly formService = inject(CourseRegFormFormService);
  private readonly dialogRef = inject(MatDialogRef<CourseRegFormFormComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as CourseRegFormFormDialogData | null;

  @Input() entity: ICourseRegForm | null = null;
  @Input() heading?: string;

  @Output() saved = new EventEmitter<ICourseRegForm>();
  @Output() cancelled = new EventEmitter<void>();

  form: CourseRegFormFormGroup = this.formService.createCourseRegFormFormGroup();
  isSaving = false;
  isInitialized = false;
  errorMessage: string | null = null;


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
      this.formService.resetForm(this.form, { ...(changes['entity'].currentValue as ICourseRegForm) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;
    const payload = this.formService.getCourseRegForm(this.form);
    const isUpdate = payload.id !== null;
    const request$ = isUpdate
      ? this.courseRegFormService.update(payload as ICourseRegForm)
      : this.courseRegFormService.create(payload as NewCourseRegForm);

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
      this.formService.resetForm(this.form, { id: null, ...defaults } as Partial<NewCourseRegForm>);
    }
  }

  private loadRelationshipOptions(): void {
    
  }
}
