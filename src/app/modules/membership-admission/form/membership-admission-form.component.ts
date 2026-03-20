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

import { IMembershipAdmission, NewMembershipAdmission } from '../membership-admission.model';
import { MembershipAdmissionService } from '../service/membership-admission.service';
import { MembershipAdmissionFormGroup, MembershipAdmissionFormService } from '../update/membership-admission-form.service';
import { IMembershipCategory } from '../../membership-category/membership-category.model';
import { MembershipCategoryService } from '../../membership-category/service/membership-category.service';




import { ApplicationStatus } from '../../../enums/application-status.model';

type MembershipAdmissionFormDialogData = {
  entity?: IMembershipAdmission;
  defaults?: Partial<NewMembershipAdmission>;
  heading?: string;
};

@Component({
  selector: 'app-membership-admission-form',
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
  templateUrl: './membership-admission-form.component.html',
})
export class MembershipAdmissionFormComponent implements OnInit, OnChanges {
  private readonly membershipAdmissionService = inject(MembershipAdmissionService);
  private readonly membershipCategoryService = inject(MembershipCategoryService);
  private readonly formService = inject(MembershipAdmissionFormService);
  private readonly dialogRef = inject(MatDialogRef<MembershipAdmissionFormComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as MembershipAdmissionFormDialogData | null;

  @Input() entity: IMembershipAdmission | null = null;
  @Input() heading?: string;

  @Output() saved = new EventEmitter<IMembershipAdmission>();
  @Output() cancelled = new EventEmitter<void>();

  form: MembershipAdmissionFormGroup = this.formService.createMembershipAdmissionFormGroup();
  isSaving = false;
  isInitialized = false;
  errorMessage: string | null = null;

  membershipCategories: IMembershipCategory[] = [];

  readonly applicationStatusOptions = Object.keys(ApplicationStatus);




  ngOnInit(): void {
    this.initializeFormFromInputs();
    this.loadRelationshipOptions();
    this.setupMembershipCategorySync();
    this.isInitialized = true;

    // Debug: Log the status options
    console.log('Application Status Options:', this.applicationStatusOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized) {
      return;
    }
    if (changes['entity'] && changes['entity'].currentValue) {
      this.formService.resetForm(this.form, { ...(changes['entity'].currentValue as IMembershipAdmission) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;
    let payload = this.formService.getMembershipAdmission(this.form);

    // Debug: Log the payload to see what's being submitted
    console.log('Form payload before:', JSON.stringify(payload, null, 2));
    console.log('Email value:', payload.email);
    console.log('Status value before:', payload.status);

    const isUpdate = payload.id !== null;

    // Set status to PENDING when creating a new membership admission
    if (!isUpdate) {
      payload = { ...payload, status: ApplicationStatus.PENDING };
    }

    console.log('Status value after:', payload.status);

    const request$ = isUpdate
      ? this.membershipAdmissionService.update(payload as IMembershipAdmission)
      : this.membershipAdmissionService.create(payload as NewMembershipAdmission);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: response => {
        console.log('Backend response:', JSON.stringify(response.body, null, 2));
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
      this.formService.resetForm(this.form, { id: null, ...defaults } as Partial<NewMembershipAdmission>);
    }
  }

  private loadRelationshipOptions(): void {
    this.membershipCategoryService.query().subscribe(response => {
      this.membershipCategories = response.body ?? [];
      this.updateMembershipCategory(this.form.controls.membershipCategoryId.value);
    });
  }

  private setupMembershipCategorySync(): void {
    this.form.controls.membershipCategoryId.valueChanges.subscribe(id => {
      this.updateMembershipCategory(id);
    });
  }

  private updateMembershipCategory(id: number | null): void {
    if (id && this.membershipCategories.length > 0) {
      const category = this.membershipCategories.find(c => c.id === id);
      this.form.controls.membershipCategory.setValue(category ? { id } : null);
    } else {
      this.form.controls.membershipCategory.setValue(null);
    }
  }
}
