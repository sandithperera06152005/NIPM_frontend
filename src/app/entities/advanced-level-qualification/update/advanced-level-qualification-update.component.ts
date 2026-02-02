import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from '../service/advanced-level-qualification.service';
import { AdvancedLevelQualificationFormGroup, AdvancedLevelQualificationFormService } from './advanced-level-qualification-form.service';

@Component({
  selector: 'jhi-advanced-level-qualification-update',
  templateUrl: './advanced-level-qualification-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AdvancedLevelQualificationUpdateComponent implements OnInit {
  isSaving = false;
  advancedLevelQualification: IAdvancedLevelQualification | null = null;

  applicantsSharedCollection: IApplicant[] = [];

  protected advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
  protected advancedLevelQualificationFormService = inject(AdvancedLevelQualificationFormService);
  protected applicantService = inject(ApplicantService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AdvancedLevelQualificationFormGroup = this.advancedLevelQualificationFormService.createAdvancedLevelQualificationFormGroup();

  compareApplicant = (o1: IApplicant | null, o2: IApplicant | null): boolean => this.applicantService.compareApplicant(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ advancedLevelQualification }) => {
      this.advancedLevelQualification = advancedLevelQualification;
      if (advancedLevelQualification) {
        this.updateForm(advancedLevelQualification);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const advancedLevelQualification = this.advancedLevelQualificationFormService.getAdvancedLevelQualification(this.editForm);
    if (advancedLevelQualification.id !== null) {
      this.subscribeToSaveResponse(this.advancedLevelQualificationService.update(advancedLevelQualification));
    } else {
      this.subscribeToSaveResponse(this.advancedLevelQualificationService.create(advancedLevelQualification));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAdvancedLevelQualification>>): void {
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

  protected updateForm(advancedLevelQualification: IAdvancedLevelQualification): void {
    this.advancedLevelQualification = advancedLevelQualification;
    this.advancedLevelQualificationFormService.resetForm(this.editForm, advancedLevelQualification);

    this.applicantsSharedCollection = this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(
      this.applicantsSharedCollection,
      advancedLevelQualification.applicant,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.applicantService
      .query()
      .pipe(map((res: HttpResponse<IApplicant[]>) => res.body ?? []))
      .pipe(
        map((applicants: IApplicant[]) =>
          this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(applicants, this.advancedLevelQualification?.applicant),
        ),
      )
      .subscribe((applicants: IApplicant[]) => (this.applicantsSharedCollection = applicants));
  }
}
