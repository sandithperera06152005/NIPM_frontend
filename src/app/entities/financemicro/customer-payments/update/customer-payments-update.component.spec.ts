import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { CustomerPaymentsService } from '../service/customer-payments.service';
import { ICustomerPayments } from '../customer-payments.model';
import { CustomerPaymentsFormService } from './customer-payments-form.service';

import { CustomerPaymentsUpdateComponent } from './customer-payments-update.component';

describe('CustomerPayments Management Update Component', () => {
  let comp: CustomerPaymentsUpdateComponent;
  let fixture: ComponentFixture<CustomerPaymentsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let customerPaymentsFormService: CustomerPaymentsFormService;
  let customerPaymentsService: CustomerPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerPaymentsUpdateComponent],
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
      .overrideTemplate(CustomerPaymentsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CustomerPaymentsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    customerPaymentsFormService = TestBed.inject(CustomerPaymentsFormService);
    customerPaymentsService = TestBed.inject(CustomerPaymentsService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const customerPayments: ICustomerPayments = { id: 18404 };

      activatedRoute.data = of({ customerPayments });
      comp.ngOnInit();

      expect(comp.customerPayments).toEqual(customerPayments);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomerPayments>>();
      const customerPayments = { id: 526 };
      jest.spyOn(customerPaymentsFormService, 'getCustomerPayments').mockReturnValue(customerPayments);
      jest.spyOn(customerPaymentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerPayments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customerPayments }));
      saveSubject.complete();

      // THEN
      expect(customerPaymentsFormService.getCustomerPayments).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(customerPaymentsService.update).toHaveBeenCalledWith(expect.objectContaining(customerPayments));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomerPayments>>();
      const customerPayments = { id: 526 };
      jest.spyOn(customerPaymentsFormService, 'getCustomerPayments').mockReturnValue({ id: null });
      jest.spyOn(customerPaymentsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerPayments: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customerPayments }));
      saveSubject.complete();

      // THEN
      expect(customerPaymentsFormService.getCustomerPayments).toHaveBeenCalled();
      expect(customerPaymentsService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomerPayments>>();
      const customerPayments = { id: 526 };
      jest.spyOn(customerPaymentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerPayments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(customerPaymentsService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
