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
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { AchievementService } from '../service/achievement.service';
import { IAchievement } from '../achievement.model';
import { AchievementFormGroup, AchievementFormService } from './achievement-form.service';

@Component({
  selector: 'jhi-achievement-update',
  templateUrl: './achievement-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AchievementUpdateComponent implements OnInit {
  isSaving = false;
  achievement: IAchievement | null = null;

  applicantsSharedCollection: IApplicant[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected achievementService = inject(AchievementService);
  protected achievementFormService = inject(AchievementFormService);
  protected applicantService = inject(ApplicantService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AchievementFormGroup = this.achievementFormService.createAchievementFormGroup();

  compareApplicant = (o1: IApplicant | null, o2: IApplicant | null): boolean => this.applicantService.compareApplicant(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ achievement }) => {
      this.achievement = achievement;
      if (achievement) {
        this.updateForm(achievement);
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
    const achievement = this.achievementFormService.getAchievement(this.editForm);
    if (achievement.id !== null) {
      this.subscribeToSaveResponse(this.achievementService.update(achievement));
    } else {
      this.subscribeToSaveResponse(this.achievementService.create(achievement));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAchievement>>): void {
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

  protected updateForm(achievement: IAchievement): void {
    this.achievement = achievement;
    this.achievementFormService.resetForm(this.editForm, achievement);

    this.applicantsSharedCollection = this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(
      this.applicantsSharedCollection,
      achievement.applicant,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.applicantService
      .query()
      .pipe(map((res: HttpResponse<IApplicant[]>) => res.body ?? []))
      .pipe(
        map((applicants: IApplicant[]) =>
          this.applicantService.addApplicantToCollectionIfMissing<IApplicant>(applicants, this.achievement?.applicant),
        ),
      )
      .subscribe((applicants: IApplicant[]) => (this.applicantsSharedCollection = applicants));
  }
}
