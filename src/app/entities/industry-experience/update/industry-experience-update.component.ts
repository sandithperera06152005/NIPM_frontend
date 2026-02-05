import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IIndustryExperience } from '../industry-experience.model';
import { IndustryExperienceService } from '../service/industry-experience.service';
import { IndustryExperienceFormGroup, IndustryExperienceFormService } from './industry-experience-form.service';

@Component({
  selector: 'jhi-industry-experience-update',
  templateUrl: './industry-experience-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class IndustryExperienceUpdateComponent implements OnInit {
  isSaving = false;
  industryExperience: IIndustryExperience | null = null;

  applicantsSharedCollection: IApplicant[] = [];

  protected industryExperienceService = inject(IndustryExperienceService);
  protected industryExperienceFormService = inject(IndustryExperienceFormService);
  protected applicantService = inject(ApplicantService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: IndustryExperienceFormGroup = this.industryExperienceFormService.createIndustryExperienceFormGroup();

  compareApplicant = (o1: IApplicant | null, o2: IApplicant | null): boolean => this.applicantService.compareApplicant(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ industryExperience }) => {
      this.industryExperience = industryExperience;
      if (industryExperience) {
        this.updateForm(industryExperience);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const industryExperience = this.industryExperienceFormService.getIndustryExperience(this.editForm);
    if (industryExperience.id !== null) {
      this.subscribeToSaveResponse(this.industryExperienceService.update(industryExperience));
    } else {
      this.subscribeToSaveResponse(this.industryExperienceService.create(industryExperience));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IIndustryExperience>>): void {
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

  protected updateForm(industryExperience: IIndustryExperience): void {
    this.industryExperience = industryExperience;
    this.industryExperienceFormService.resetForm(this.editForm, industryExperience);

    this.applicantsSharedCollection = this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(
      this.applicantsSharedCollection,
      industryExperience.applicant,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.applicantService
      .query()
      .pipe(map((res: HttpResponse<IApplicant[]>) => res.body ?? []))
      .pipe(
        map((applicants: IApplicant[]) =>
          this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(applicants, this.industryExperience?.applicant),
        ),
      )
      .subscribe((applicants: IApplicant[]) => (this.applicantsSharedCollection = applicants));
  }
}
