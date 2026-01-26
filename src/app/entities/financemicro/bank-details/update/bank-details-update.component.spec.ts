import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { BankDetailsService } from '../service/bank-details.service';
import { IBankDetails } from '../bank-details.model';
import { BankDetailsFormService } from './bank-details-form.service';

import { BankDetailsUpdateComponent } from './bank-details-update.component';

describe('BankDetails Management Update Component', () => {
  let comp: BankDetailsUpdateComponent;
  let fixture: ComponentFixture<BankDetailsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let bankDetailsFormService: BankDetailsFormService;
  let bankDetailsService: BankDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BankDetailsUpdateComponent],
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
      .overrideTemplate(BankDetailsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BankDetailsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    bankDetailsFormService = TestBed.inject(BankDetailsFormService);
    bankDetailsService = TestBed.inject(BankDetailsService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const bankDetails: IBankDetails = { id: 15871 };

      activatedRoute.data = of({ bankDetails });
      comp.ngOnInit();

      expect(comp.bankDetails).toEqual(bankDetails);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBankDetails>>();
      const bankDetails = { id: 7814 };
      jest.spyOn(bankDetailsFormService, 'getBankDetails').mockReturnValue(bankDetails);
      jest.spyOn(bankDetailsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bankDetails });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bankDetails }));
      saveSubject.complete();

      // THEN
      expect(bankDetailsFormService.getBankDetails).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(bankDetailsService.update).toHaveBeenCalledWith(expect.objectContaining(bankDetails));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBankDetails>>();
      const bankDetails = { id: 7814 };
      jest.spyOn(bankDetailsFormService, 'getBankDetails').mockReturnValue({ id: null });
      jest.spyOn(bankDetailsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bankDetails: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bankDetails }));
      saveSubject.complete();

      // THEN
      expect(bankDetailsFormService.getBankDetails).toHaveBeenCalled();
      expect(bankDetailsService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBankDetails>>();
      const bankDetails = { id: 7814 };
      jest.spyOn(bankDetailsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bankDetails });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(bankDetailsService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
