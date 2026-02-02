import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IAdvancedLevelQualification } from 'app/entities/advanced-level-qualification/advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import { AdvancedLevelSubjectService } from '../service/advanced-level-subject.service';
import { AdvancedLevelSubjectFormGroup, AdvancedLevelSubjectFormService } from './advanced-level-subject-form.service';

@Component({
  selector: 'jhi-advanced-level-subject-update',
  templateUrl: './advanced-level-subject-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AdvancedLevelSubjectUpdateComponent implements OnInit {
  isSaving = false;
  advancedLevelSubject: IAdvancedLevelSubject | null = null;

  advancedLevelQualificationsSharedCollection: IAdvancedLevelQualification[] = [];

  protected advancedLevelSubjectService = inject(AdvancedLevelSubjectService);
  protected advancedLevelSubjectFormService = inject(AdvancedLevelSubjectFormService);
  protected advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AdvancedLevelSubjectFormGroup = this.advancedLevelSubjectFormService.createAdvancedLevelSubjectFormGroup();

  compareAdvancedLevelQualification = (o1: IAdvancedLevelQualification | null, o2: IAdvancedLevelQualification | null): boolean =>
    this.advancedLevelQualificationService.compareAdvancedLevelQualification(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ advancedLevelSubject }) => {
      this.advancedLevelSubject = advancedLevelSubject;
      if (advancedLevelSubject) {
        this.updateForm(advancedLevelSubject);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const advancedLevelSubject = this.advancedLevelSubjectFormService.getAdvancedLevelSubject(this.editForm);
    if (advancedLevelSubject.id !== null) {
      this.subscribeToSaveResponse(this.advancedLevelSubjectService.update(advancedLevelSubject));
    } else {
      this.subscribeToSaveResponse(this.advancedLevelSubjectService.create(advancedLevelSubject));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAdvancedLevelSubject>>): void {
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

  protected updateForm(advancedLevelSubject: IAdvancedLevelSubject): void {
    this.advancedLevelSubject = advancedLevelSubject;
    this.advancedLevelSubjectFormService.resetForm(this.editForm, advancedLevelSubject);

    this.advancedLevelQualificationsSharedCollection =
      this.advancedLevelQualificationService.addAdvancedLevelQualificationToCollectionIfMissing<IAdvancedLevelQualification>(
        this.advancedLevelQualificationsSharedCollection,
        advancedLevelSubject.advancedLevelQualification,
      );
  }

  protected loadRelationshipsOptions(): void {
    this.advancedLevelQualificationService
      .query()
      .pipe(map((res: HttpResponse<IAdvancedLevelQualification[]>) => res.body ?? []))
      .pipe(
        map((advancedLevelQualifications: IAdvancedLevelQualification[]) =>
          this.advancedLevelQualificationService.addAdvancedLevelQualificationToCollectionIfMissing<IAdvancedLevelQualification>(
            advancedLevelQualifications,
            this.advancedLevelSubject?.advancedLevelQualification,
          ),
        ),
      )
      .subscribe(
        (advancedLevelQualifications: IAdvancedLevelQualification[]) =>
          (this.advancedLevelQualificationsSharedCollection = advancedLevelQualifications),
      );
  }
}
