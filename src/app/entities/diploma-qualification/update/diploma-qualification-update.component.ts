import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { NVQType } from 'app/entities/enumerations/nvq-type.model';
import { DiplomaQualificationService } from '../service/diploma-qualification.service';
import { IDiplomaQualification } from '../diploma-qualification.model';
import { DiplomaQualificationFormGroup, DiplomaQualificationFormService } from './diploma-qualification-form.service';

@Component({
  selector: 'jhi-diploma-qualification-update',
  templateUrl: './diploma-qualification-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class DiplomaQualificationUpdateComponent implements OnInit {
  isSaving = false;
  diplomaQualification: IDiplomaQualification | null = null;
  nVQTypeValues = Object.keys(NVQType);

  applicantsSharedCollection: IApplicant[] = [];

  protected diplomaQualificationService = inject(DiplomaQualificationService);
  protected diplomaQualificationFormService = inject(DiplomaQualificationFormService);
  protected applicantService = inject(ApplicantService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DiplomaQualificationFormGroup = this.diplomaQualificationFormService.createDiplomaQualificationFormGroup();

  compareApplicant = (o1: IApplicant | null, o2: IApplicant | null): boolean => this.applicantService.compareApplicant(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ diplomaQualification }) => {
      this.diplomaQualification = diplomaQualification;
      if (diplomaQualification) {
        this.updateForm(diplomaQualification);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const diplomaQualification = this.diplomaQualificationFormService.getDiplomaQualification(this.editForm);
    if (diplomaQualification.id !== null) {
      this.subscribeToSaveResponse(this.diplomaQualificationService.update(diplomaQualification));
    } else {
      this.subscribeToSaveResponse(this.diplomaQualificationService.create(diplomaQualification));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDiplomaQualification>>): void {
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

  protected updateForm(diplomaQualification: IDiplomaQualification): void {
    this.diplomaQualification = diplomaQualification;
    this.diplomaQualificationFormService.resetForm(this.editForm, diplomaQualification);

    this.applicantsSharedCollection = this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(
      this.applicantsSharedCollection,
      diplomaQualification.applicant,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.applicantService
      .query()
      .pipe(map((res: HttpResponse<IApplicant[]>) => res.body ?? []))
      .pipe(
        map((applicants: IApplicant[]) =>
          this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(applicants, this.diplomaQualification?.applicant),
        ),
      )
      .subscribe((applicants: IApplicant[]) => (this.applicantsSharedCollection = applicants));
  }
}
