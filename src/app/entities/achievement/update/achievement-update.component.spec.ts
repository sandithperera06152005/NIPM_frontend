import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { AchievementService } from '../service/achievement.service';
import { IAchievement } from '../achievement.model';
import { AchievementFormService } from './achievement-form.service';

import { AchievementUpdateComponent } from './achievement-update.component';

describe('Achievement Management Update Component', () => {
  let comp: AchievementUpdateComponent;
  let fixture: ComponentFixture<AchievementUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let achievementFormService: AchievementFormService;
  let achievementService: AchievementService;
  let applicantService: ApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AchievementUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AchievementUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AchievementUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    achievementFormService = TestBed.inject(AchievementFormService);
    achievementService = TestBed.inject(AchievementService);
    applicantService = TestBed.inject(ApplicantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Applicant query and add missing value', () => {
      const achievement: IAchievement = { id: 27064 };
      const applicant: IApplicant = { id: 12167 };
      achievement.applicant = applicant;

      const applicantCollection: IApplicant[] = [{ id: 12167 }];
      jest.spyOn(applicantService, 'query').mockReturnValue(of(new HttpResponse({ body: applicantCollection })));
      const additionalApplicants = [applicant];
      const expectedCollection: IApplicant[] = [...additionalApplicants, ...applicantCollection];
      jest.spyOn(applicantService, 'addApplicantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ achievement });
      comp.ngOnInit();

      expect(applicantService.query).toHaveBeenCalled();
      expect(applicantService.addApplicantToCollectionIfMissing).toHaveBeenCalledWith(
        applicantCollection,
        ...additionalApplicants.map(expect.objectContaining),
      );
      expect(comp.applicantsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const achievement: IAchievement = { id: 27064 };
      const applicant: IApplicant = { id: 12167 };
      achievement.applicant = applicant;

      activatedRoute.data = of({ achievement });
      comp.ngOnInit();

      expect(comp.applicantsSharedCollection).toContainEqual(applicant);
      expect(comp.achievement).toEqual(achievement);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAchievement>>();
      const achievement = { id: 17559 };
      jest.spyOn(achievementFormService, 'getAchievement').mockReturnValue(achievement);
      jest.spyOn(achievementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ achievement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: achievement }));
      saveSubject.complete();

      // THEN
      expect(achievementFormService.getAchievement).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(achievementService.update).toHaveBeenCalledWith(expect.objectContaining(achievement));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAchievement>>();
      const achievement = { id: 17559 };
      jest.spyOn(achievementFormService, 'getAchievement').mockReturnValue({ id: null });
      jest.spyOn(achievementService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ achievement: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: achievement }));
      saveSubject.complete();

      // THEN
      expect(achievementFormService.getAchievement).toHaveBeenCalled();
      expect(achievementService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAchievement>>();
      const achievement = { id: 17559 };
      jest.spyOn(achievementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ achievement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(achievementService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareApplicant', () => {
      it('should forward to applicantService', () => {
        const entity = { id: 12167 };
        const entity2 = { id: 10883 };
        jest.spyOn(applicantService, 'compareApplicant');
        comp.compareApplicant(entity, entity2);
        expect(applicantService.compareApplicant).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
