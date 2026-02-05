import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { DiplomaQualificationService } from '../service/diploma-qualification.service';
import { IDiplomaQualification } from '../diploma-qualification.model';
import { DiplomaQualificationFormService } from './diploma-qualification-form.service';

import { DiplomaQualificationUpdateComponent } from './diploma-qualification-update.component';

describe('DiplomaQualification Management Update Component', () => {
  let comp: DiplomaQualificationUpdateComponent;
  let fixture: ComponentFixture<DiplomaQualificationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let diplomaQualificationFormService: DiplomaQualificationFormService;
  let diplomaQualificationService: DiplomaQualificationService;
  let applicantService: ApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiplomaQualificationUpdateComponent],
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
      .overrideTemplate(DiplomaQualificationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DiplomaQualificationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    diplomaQualificationFormService = TestBed.inject(DiplomaQualificationFormService);
    diplomaQualificationService = TestBed.inject(DiplomaQualificationService);
    applicantService = TestBed.inject(ApplicantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Applicant query and add missing value', () => {
      const diplomaQualification: IDiplomaQualification = { id: 7238 };
      const applicant: IApplicant = { id: 12167 };
      diplomaQualification.applicant = applicant;

      const applicantCollection: IApplicant[] = [{ id: 12167 }];
      jest.spyOn(applicantService, 'query').mockReturnValue(of(new HttpResponse({ body: applicantCollection })));
      const additionalApplicants = [applicant];
      const expectedCollection: IApplicant[] = [...additionalApplicants, ...applicantCollection];
      jest.spyOn(applicantService, 'addApplicantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ diplomaQualification });
      comp.ngOnInit();

      expect(applicantService.query).toHaveBeenCalled();
      expect(applicantService.addApplicantToCollectionIfMissing).toHaveBeenCalledWith(
        applicantCollection,
        ...additionalApplicants.map(expect.objectContaining),
      );
      expect(comp.applicantsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const diplomaQualification: IDiplomaQualification = { id: 7238 };
      const applicant: IApplicant = { id: 12167 };
      diplomaQualification.applicant = applicant;

      activatedRoute.data = of({ diplomaQualification });
      comp.ngOnInit();

      expect(comp.applicantsSharedCollection).toContainEqual(applicant);
      expect(comp.diplomaQualification).toEqual(diplomaQualification);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDiplomaQualification>>();
      const diplomaQualification = { id: 25116 };
      jest.spyOn(diplomaQualificationFormService, 'getDiplomaQualification').mockReturnValue(diplomaQualification);
      jest.spyOn(diplomaQualificationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ diplomaQualification });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: diplomaQualification }));
      saveSubject.complete();

      // THEN
      expect(diplomaQualificationFormService.getDiplomaQualification).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(diplomaQualificationService.update).toHaveBeenCalledWith(expect.objectContaining(diplomaQualification));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDiplomaQualification>>();
      const diplomaQualification = { id: 25116 };
      jest.spyOn(diplomaQualificationFormService, 'getDiplomaQualification').mockReturnValue({ id: null });
      jest.spyOn(diplomaQualificationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ diplomaQualification: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: diplomaQualification }));
      saveSubject.complete();

      // THEN
      expect(diplomaQualificationFormService.getDiplomaQualification).toHaveBeenCalled();
      expect(diplomaQualificationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDiplomaQualification>>();
      const diplomaQualification = { id: 25116 };
      jest.spyOn(diplomaQualificationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ diplomaQualification });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(diplomaQualificationService.update).toHaveBeenCalled();
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
