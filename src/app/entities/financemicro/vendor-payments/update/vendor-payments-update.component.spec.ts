import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { VendorPaymentsService } from '../service/vendor-payments.service';
import { IVendorPayments } from '../vendor-payments.model';
import { VendorPaymentsFormService } from './vendor-payments-form.service';

import { VendorPaymentsUpdateComponent } from './vendor-payments-update.component';

describe('VendorPayments Management Update Component', () => {
  let comp: VendorPaymentsUpdateComponent;
  let fixture: ComponentFixture<VendorPaymentsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let vendorPaymentsFormService: VendorPaymentsFormService;
  let vendorPaymentsService: VendorPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VendorPaymentsUpdateComponent],
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
      .overrideTemplate(VendorPaymentsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(VendorPaymentsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    vendorPaymentsFormService = TestBed.inject(VendorPaymentsFormService);
    vendorPaymentsService = TestBed.inject(VendorPaymentsService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const vendorPayments: IVendorPayments = { id: 8632 };

      activatedRoute.data = of({ vendorPayments });
      comp.ngOnInit();

      expect(comp.vendorPayments).toEqual(vendorPayments);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVendorPayments>>();
      const vendorPayments = { id: 20190 };
      jest.spyOn(vendorPaymentsFormService, 'getVendorPayments').mockReturnValue(vendorPayments);
      jest.spyOn(vendorPaymentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vendorPayments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: vendorPayments }));
      saveSubject.complete();

      // THEN
      expect(vendorPaymentsFormService.getVendorPayments).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(vendorPaymentsService.update).toHaveBeenCalledWith(expect.objectContaining(vendorPayments));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVendorPayments>>();
      const vendorPayments = { id: 20190 };
      jest.spyOn(vendorPaymentsFormService, 'getVendorPayments').mockReturnValue({ id: null });
      jest.spyOn(vendorPaymentsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vendorPayments: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: vendorPayments }));
      saveSubject.complete();

      // THEN
      expect(vendorPaymentsFormService.getVendorPayments).toHaveBeenCalled();
      expect(vendorPaymentsService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVendorPayments>>();
      const vendorPayments = { id: 20190 };
      jest.spyOn(vendorPaymentsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vendorPayments });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(vendorPaymentsService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
