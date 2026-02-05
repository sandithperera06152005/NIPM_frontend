import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { EmploymentService } from '../service/employment.service';
import { IEmployment } from '../employment.model';
import { EmploymentFormService } from './employment-form.service';

import { EmploymentUpdateComponent } from './employment-update.component';

describe('Employment Management Update Component', () => {
  let comp: EmploymentUpdateComponent;
  let fixture: ComponentFixture<EmploymentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let employmentFormService: EmploymentFormService;
  let employmentService: EmploymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmploymentUpdateComponent],
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
      .overrideTemplate(EmploymentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EmploymentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    employmentFormService = TestBed.inject(EmploymentFormService);
    employmentService = TestBed.inject(EmploymentService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const employment: IEmployment = { id: 21536 };

      activatedRoute.data = of({ employment });
      comp.ngOnInit();

      expect(comp.employment).toEqual(employment);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployment>>();
      const employment = { id: 30829 };
      jest.spyOn(employmentFormService, 'getEmployment').mockReturnValue(employment);
      jest.spyOn(employmentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employment }));
      saveSubject.complete();

      // THEN
      expect(employmentFormService.getEmployment).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(employmentService.update).toHaveBeenCalledWith(expect.objectContaining(employment));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployment>>();
      const employment = { id: 30829 };
      jest.spyOn(employmentFormService, 'getEmployment').mockReturnValue({ id: null });
      jest.spyOn(employmentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employment: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employment }));
      saveSubject.complete();

      // THEN
      expect(employmentFormService.getEmployment).toHaveBeenCalled();
      expect(employmentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployment>>();
      const employment = { id: 30829 };
      jest.spyOn(employmentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(employmentService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
