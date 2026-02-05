import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { AdvancedLevelQualificationService } from '../service/advanced-level-qualification.service';
import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';
import { AdvancedLevelQualificationFormService } from './advanced-level-qualification-form.service';

import { AdvancedLevelQualificationUpdateComponent } from './advanced-level-qualification-update.component';

describe('AdvancedLevelQualification Management Update Component', () => {
  let comp: AdvancedLevelQualificationUpdateComponent;
  let fixture: ComponentFixture<AdvancedLevelQualificationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let advancedLevelQualificationFormService: AdvancedLevelQualificationFormService;
  let advancedLevelQualificationService: AdvancedLevelQualificationService;
  let applicantService: ApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdvancedLevelQualificationUpdateComponent],
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
      .overrideTemplate(AdvancedLevelQualificationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AdvancedLevelQualificationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    advancedLevelQualificationFormService = TestBed.inject(AdvancedLevelQualificationFormService);
    advancedLevelQualificationService = TestBed.inject(AdvancedLevelQualificationService);
    applicantService = TestBed.inject(ApplicantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Applicant query and add missing value', () => {
      const advancedLevelQualification: IAdvancedLevelQualification = { id: 13830 };
      const applicant: IApplicant = { id: 12167 };
      advancedLevelQualification.applicant = applicant;

      const applicantCollection: IApplicant[] = [{ id: 12167 }];
      jest.spyOn(applicantService, 'query').mockReturnValue(of(new HttpResponse({ body: applicantCollection })));
      const additionalApplicants = [applicant];
      const expectedCollection: IApplicant[] = [...additionalApplicants, ...applicantCollection];
      jest.spyOn(applicantService, 'addApplicantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ advancedLevelQualification });
      comp.ngOnInit();

      expect(applicantService.query).toHaveBeenCalled();
      expect(applicantService.addApplicantToCollectionIfMissing).toHaveBeenCalledWith(
        applicantCollection,
        ...additionalApplicants.map(expect.objectContaining),
      );
      expect(comp.applicantsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const advancedLevelQualification: IAdvancedLevelQualification = { id: 13830 };
      const applicant: IApplicant = { id: 12167 };
      advancedLevelQualification.applicant = applicant;

      activatedRoute.data = of({ advancedLevelQualification });
      comp.ngOnInit();

      expect(comp.applicantsSharedCollection).toContainEqual(applicant);
      expect(comp.advancedLevelQualification).toEqual(advancedLevelQualification);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelQualification>>();
      const advancedLevelQualification = { id: 31324 };
      jest.spyOn(advancedLevelQualificationFormService, 'getAdvancedLevelQualification').mockReturnValue(advancedLevelQualification);
      jest.spyOn(advancedLevelQualificationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelQualification });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advancedLevelQualification }));
      saveSubject.complete();

      // THEN
      expect(advancedLevelQualificationFormService.getAdvancedLevelQualification).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(advancedLevelQualificationService.update).toHaveBeenCalledWith(expect.objectContaining(advancedLevelQualification));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelQualification>>();
      const advancedLevelQualification = { id: 31324 };
      jest.spyOn(advancedLevelQualificationFormService, 'getAdvancedLevelQualification').mockReturnValue({ id: null });
      jest.spyOn(advancedLevelQualificationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelQualification: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advancedLevelQualification }));
      saveSubject.complete();

      // THEN
      expect(advancedLevelQualificationFormService.getAdvancedLevelQualification).toHaveBeenCalled();
      expect(advancedLevelQualificationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelQualification>>();
      const advancedLevelQualification = { id: 31324 };
      jest.spyOn(advancedLevelQualificationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelQualification });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(advancedLevelQualificationService.update).toHaveBeenCalled();
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
