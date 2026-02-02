import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IndustryExperienceService } from '../service/industry-experience.service';
import { IIndustryExperience } from '../industry-experience.model';
import { IndustryExperienceFormService } from './industry-experience-form.service';

import { IndustryExperienceUpdateComponent } from './industry-experience-update.component';

describe('IndustryExperience Management Update Component', () => {
  let comp: IndustryExperienceUpdateComponent;
  let fixture: ComponentFixture<IndustryExperienceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let industryExperienceFormService: IndustryExperienceFormService;
  let industryExperienceService: IndustryExperienceService;
  let applicantService: ApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IndustryExperienceUpdateComponent],
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
      .overrideTemplate(IndustryExperienceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(IndustryExperienceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    industryExperienceFormService = TestBed.inject(IndustryExperienceFormService);
    industryExperienceService = TestBed.inject(IndustryExperienceService);
    applicantService = TestBed.inject(ApplicantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Applicant query and add missing value', () => {
      const industryExperience: IIndustryExperience = { id: 23337 };
      const applicant: IApplicant = { id: 12167 };
      industryExperience.applicant = applicant;

      const applicantCollection: IApplicant[] = [{ id: 12167 }];
      jest.spyOn(applicantService, 'query').mockReturnValue(of(new HttpResponse({ body: applicantCollection })));
      const additionalApplicants = [applicant];
      const expectedCollection: IApplicant[] = [...additionalApplicants, ...applicantCollection];
      jest.spyOn(applicantService, 'addApplicantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ industryExperience });
      comp.ngOnInit();

      expect(applicantService.query).toHaveBeenCalled();
      expect(applicantService.addApplicantToCollectionIfMissing).toHaveBeenCalledWith(
        applicantCollection,
        ...additionalApplicants.map(expect.objectContaining),
      );
      expect(comp.applicantsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const industryExperience: IIndustryExperience = { id: 23337 };
      const applicant: IApplicant = { id: 12167 };
      industryExperience.applicant = applicant;

      activatedRoute.data = of({ industryExperience });
      comp.ngOnInit();

      expect(comp.applicantsSharedCollection).toContainEqual(applicant);
      expect(comp.industryExperience).toEqual(industryExperience);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIndustryExperience>>();
      const industryExperience = { id: 16525 };
      jest.spyOn(industryExperienceFormService, 'getIndustryExperience').mockReturnValue(industryExperience);
      jest.spyOn(industryExperienceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ industryExperience });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: industryExperience }));
      saveSubject.complete();

      // THEN
      expect(industryExperienceFormService.getIndustryExperience).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(industryExperienceService.update).toHaveBeenCalledWith(expect.objectContaining(industryExperience));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIndustryExperience>>();
      const industryExperience = { id: 16525 };
      jest.spyOn(industryExperienceFormService, 'getIndustryExperience').mockReturnValue({ id: null });
      jest.spyOn(industryExperienceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ industryExperience: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: industryExperience }));
      saveSubject.complete();

      // THEN
      expect(industryExperienceFormService.getIndustryExperience).toHaveBeenCalled();
      expect(industryExperienceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IIndustryExperience>>();
      const industryExperience = { id: 16525 };
      jest.spyOn(industryExperienceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ industryExperience });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(industryExperienceService.update).toHaveBeenCalled();
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
