import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ChequeRegistryService } from '../service/cheque-registry.service';
import { IChequeRegistry } from '../cheque-registry.model';
import { ChequeRegistryFormService } from './cheque-registry-form.service';

import { ChequeRegistryUpdateComponent } from './cheque-registry-update.component';

describe('ChequeRegistry Management Update Component', () => {
  let comp: ChequeRegistryUpdateComponent;
  let fixture: ComponentFixture<ChequeRegistryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let chequeRegistryFormService: ChequeRegistryFormService;
  let chequeRegistryService: ChequeRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChequeRegistryUpdateComponent],
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
      .overrideTemplate(ChequeRegistryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChequeRegistryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    chequeRegistryFormService = TestBed.inject(ChequeRegistryFormService);
    chequeRegistryService = TestBed.inject(ChequeRegistryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const chequeRegistry: IChequeRegistry = { id: 30709 };

      activatedRoute.data = of({ chequeRegistry });
      comp.ngOnInit();

      expect(comp.chequeRegistry).toEqual(chequeRegistry);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChequeRegistry>>();
      const chequeRegistry = { id: 28975 };
      jest.spyOn(chequeRegistryFormService, 'getChequeRegistry').mockReturnValue(chequeRegistry);
      jest.spyOn(chequeRegistryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chequeRegistry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chequeRegistry }));
      saveSubject.complete();

      // THEN
      expect(chequeRegistryFormService.getChequeRegistry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(chequeRegistryService.update).toHaveBeenCalledWith(expect.objectContaining(chequeRegistry));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChequeRegistry>>();
      const chequeRegistry = { id: 28975 };
      jest.spyOn(chequeRegistryFormService, 'getChequeRegistry').mockReturnValue({ id: null });
      jest.spyOn(chequeRegistryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chequeRegistry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chequeRegistry }));
      saveSubject.complete();

      // THEN
      expect(chequeRegistryFormService.getChequeRegistry).toHaveBeenCalled();
      expect(chequeRegistryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChequeRegistry>>();
      const chequeRegistry = { id: 28975 };
      jest.spyOn(chequeRegistryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chequeRegistry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(chequeRegistryService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
