import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { JournalVoucherService } from '../service/journal-voucher.service';
import { IJournalVoucher } from '../journal-voucher.model';
import { JournalVoucherFormService } from './journal-voucher-form.service';

import { JournalVoucherUpdateComponent } from './journal-voucher-update.component';

describe('JournalVoucher Management Update Component', () => {
  let comp: JournalVoucherUpdateComponent;
  let fixture: ComponentFixture<JournalVoucherUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let journalVoucherFormService: JournalVoucherFormService;
  let journalVoucherService: JournalVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JournalVoucherUpdateComponent],
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
      .overrideTemplate(JournalVoucherUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(JournalVoucherUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    journalVoucherFormService = TestBed.inject(JournalVoucherFormService);
    journalVoucherService = TestBed.inject(JournalVoucherService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const journalVoucher: IJournalVoucher = { id: 17663 };

      activatedRoute.data = of({ journalVoucher });
      comp.ngOnInit();

      expect(comp.journalVoucher).toEqual(journalVoucher);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJournalVoucher>>();
      const journalVoucher = { id: 14827 };
      jest.spyOn(journalVoucherFormService, 'getJournalVoucher').mockReturnValue(journalVoucher);
      jest.spyOn(journalVoucherService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ journalVoucher });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: journalVoucher }));
      saveSubject.complete();

      // THEN
      expect(journalVoucherFormService.getJournalVoucher).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(journalVoucherService.update).toHaveBeenCalledWith(expect.objectContaining(journalVoucher));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJournalVoucher>>();
      const journalVoucher = { id: 14827 };
      jest.spyOn(journalVoucherFormService, 'getJournalVoucher').mockReturnValue({ id: null });
      jest.spyOn(journalVoucherService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ journalVoucher: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: journalVoucher }));
      saveSubject.complete();

      // THEN
      expect(journalVoucherFormService.getJournalVoucher).toHaveBeenCalled();
      expect(journalVoucherService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJournalVoucher>>();
      const journalVoucher = { id: 14827 };
      jest.spyOn(journalVoucherService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ journalVoucher });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(journalVoucherService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
