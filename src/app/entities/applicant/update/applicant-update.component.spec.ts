import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployment } from 'app/entities/employment/employment.model';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { ApplicantService } from '../service/applicant.service';
import { IApplicant } from '../applicant.model';
import { ApplicantFormService } from './applicant-form.service';

import { ApplicantUpdateComponent } from './applicant-update.component';

describe('Applicant Management Update Component', () => {
  let comp: ApplicantUpdateComponent;
  let fixture: ComponentFixture<ApplicantUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let applicantFormService: ApplicantFormService;
  let applicantService: ApplicantService;
  let employmentService: EmploymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApplicantUpdateComponent],
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
      .overrideTemplate(ApplicantUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ApplicantUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    applicantFormService = TestBed.inject(ApplicantFormService);
    applicantService = TestBed.inject(ApplicantService);
    employmentService = TestBed.inject(EmploymentService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call employment query and add missing value', () => {
      const applicant: IApplicant = { id: 10883 };
      const employment: IEmployment = { id: 30829 };
      applicant.employment = employment;

      const employmentCollection: IEmployment[] = [{ id: 30829 }];
      jest.spyOn(employmentService, 'query').mockReturnValue(of(new HttpResponse({ body: employmentCollection })));
      const expectedCollection: IEmployment[] = [employment, ...employmentCollection];
      jest.spyOn(employmentService, 'addEmploymentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ applicant });
      comp.ngOnInit();

      expect(employmentService.query).toHaveBeenCalled();
      expect(employmentService.addEmploymentToCollectionIfMissing).toHaveBeenCalledWith(employmentCollection, employment);
      expect(comp.employmentsCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const applicant: IApplicant = { id: 10883 };
      const employment: IEmployment = { id: 30829 };
      applicant.employment = employment;

      activatedRoute.data = of({ applicant });
      comp.ngOnInit();

      expect(comp.employmentsCollection).toContainEqual(employment);
      expect(comp.applicant).toEqual(applicant);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IApplicant>>();
      const applicant = { id: 12167 };
      jest.spyOn(applicantFormService, 'getApplicant').mockReturnValue(applicant);
      jest.spyOn(applicantService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ applicant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: applicant }));
      saveSubject.complete();

      // THEN
      expect(applicantFormService.getApplicant).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(applicantService.update).toHaveBeenCalledWith(expect.objectContaining(applicant));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IApplicant>>();
      const applicant = { id: 12167 };
      jest.spyOn(applicantFormService, 'getApplicant').mockReturnValue({ id: null });
      jest.spyOn(applicantService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ applicant: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: applicant }));
      saveSubject.complete();

      // THEN
      expect(applicantFormService.getApplicant).toHaveBeenCalled();
      expect(applicantService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IApplicant>>();
      const applicant = { id: 12167 };
      jest.spyOn(applicantService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ applicant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(applicantService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployment', () => {
      it('should forward to employmentService', () => {
        const entity = { id: 30829 };
        const entity2 = { id: 21536 };
        jest.spyOn(employmentService, 'compareEmployment');
        comp.compareEmployment(entity, entity2);
        expect(employmentService.compareEmployment).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
