import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IEmployment } from 'app/entities/employment/employment.model';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { Gender } from 'app/entities/enumerations/gender.model';
import { CourseType } from 'app/entities/enumerations/course-type.model';
import { FinanceType } from 'app/entities/enumerations/finance-type.model';
import { ApplicantService } from '../service/applicant.service';
import { IApplicant } from '../applicant.model';
import { ApplicantFormGroup, ApplicantFormService } from './applicant-form.service';

@Component({
  selector: 'jhi-applicant-update',
  templateUrl: './applicant-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ApplicantUpdateComponent implements OnInit {
  isSaving = false;
  applicant: IApplicant | null = null;
  genderValues = Object.keys(Gender);
  courseTypeValues = Object.keys(CourseType);
  financeTypeValues = Object.keys(FinanceType);

  employmentsCollection: IEmployment[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected applicantService = inject(ApplicantService);
  protected applicantFormService = inject(ApplicantFormService);
  protected employmentService = inject(EmploymentService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ApplicantFormGroup = this.applicantFormService.createApplicantFormGroup();

  compareEmployment = (o1: IEmployment | null, o2: IEmployment | null): boolean => this.employmentService.compareEmployment(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ applicant }) => {
      this.applicant = applicant;
      if (applicant) {
        this.updateForm(applicant);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('nipmApp.error', { message: err.message })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const applicant = this.applicantFormService.getApplicant(this.editForm);
    if (applicant.id !== null) {
      this.subscribeToSaveResponse(this.applicantService.update(applicant));
    } else {
      this.subscribeToSaveResponse(this.applicantService.create(applicant));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IApplicant>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(applicant: IApplicant): void {
    this.applicant = applicant;
    this.applicantFormService.resetForm(this.editForm, applicant);

    this.employmentsCollection = this.employmentService.addEmploymentToCollectionIfMissing<IEmployment>(
      this.employmentsCollection,
      applicant.employment,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employmentService
      .query({ filter: 'applicant-is-null' })
      .pipe(map((res: HttpResponse<IEmployment[]>) => res.body ?? []))
      .pipe(
        map((employments: IEmployment[]) =>
          this.employmentService.addEmploymentToCollectionIfMissing<IEmployment>(employments, this.applicant?.employment),
        ),
      )
      .subscribe((employments: IEmployment[]) => (this.employmentsCollection = employments));
  }
}
