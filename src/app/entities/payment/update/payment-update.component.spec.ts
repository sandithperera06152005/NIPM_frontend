import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IMembershipAdmission } from 'app/entities/membership-admission/membership-admission.model';
import { MembershipAdmissionService } from 'app/entities/membership-admission/service/membership-admission.service';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IPayment } from '../payment.model';
import { PaymentService } from '../service/payment.service';
import { PaymentFormService } from './payment-form.service';

import { PaymentUpdateComponent } from './payment-update.component';

describe('Payment Management Update Component', () => {
  let comp: PaymentUpdateComponent;
  let fixture: ComponentFixture<PaymentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let paymentFormService: PaymentFormService;
  let paymentService: PaymentService;
  let membershipAdmissionService: MembershipAdmissionService;
  let applicantService: ApplicantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaymentUpdateComponent],
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
      .overrideTemplate(PaymentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PaymentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    paymentFormService = TestBed.inject(PaymentFormService);
    paymentService = TestBed.inject(PaymentService);
    membershipAdmissionService = TestBed.inject(MembershipAdmissionService);
    applicantService = TestBed.inject(ApplicantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call MembershipAdmission query and add missing value', () => {
      const payment: IPayment = { id: 31232 };
      const membershipAdmission: IMembershipAdmission = { id: 32173 };
      payment.membershipAdmission = membershipAdmission;

      const membershipAdmissionCollection: IMembershipAdmission[] = [{ id: 32173 }];
      jest.spyOn(membershipAdmissionService, 'query').mockReturnValue(of(new HttpResponse({ body: membershipAdmissionCollection })));
      const additionalMembershipAdmissions = [membershipAdmission];
      const expectedCollection: IMembershipAdmission[] = [...additionalMembershipAdmissions, ...membershipAdmissionCollection];
      jest.spyOn(membershipAdmissionService, 'addMembershipAdmissionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(membershipAdmissionService.query).toHaveBeenCalled();
      expect(membershipAdmissionService.addMembershipAdmissionToCollectionIfMissing).toHaveBeenCalledWith(
        membershipAdmissionCollection,
        ...additionalMembershipAdmissions.map(expect.objectContaining),
      );
      expect(comp.membershipAdmissionsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Applicant query and add missing value', () => {
      const payment: IPayment = { id: 31232 };
      const applicant: IApplicant = { id: 12167 };
      payment.applicant = applicant;

      const applicantCollection: IApplicant[] = [{ id: 12167 }];
      jest.spyOn(applicantService, 'query').mockReturnValue(of(new HttpResponse({ body: applicantCollection })));
      const additionalApplicants = [applicant];
      const expectedCollection: IApplicant[] = [...additionalApplicants, ...applicantCollection];
      jest.spyOn(applicantService, 'addApplicantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(applicantService.query).toHaveBeenCalled();
      expect(applicantService.addApplicantToCollectionIfMissing).toHaveBeenCalledWith(
        applicantCollection,
        ...additionalApplicants.map(expect.objectContaining),
      );
      expect(comp.applicantsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const payment: IPayment = { id: 31232 };
      const membershipAdmission: IMembershipAdmission = { id: 32173 };
      payment.membershipAdmission = membershipAdmission;
      const applicant: IApplicant = { id: 12167 };
      payment.applicant = applicant;

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(comp.membershipAdmissionsSharedCollection).toContainEqual(membershipAdmission);
      expect(comp.applicantsSharedCollection).toContainEqual(applicant);
      expect(comp.payment).toEqual(payment);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      jest.spyOn(paymentFormService, 'getPayment').mockReturnValue(payment);
      jest.spyOn(paymentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payment }));
      saveSubject.complete();

      // THEN
      expect(paymentFormService.getPayment).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paymentService.update).toHaveBeenCalledWith(expect.objectContaining(payment));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      jest.spyOn(paymentFormService, 'getPayment').mockReturnValue({ id: null });
      jest.spyOn(paymentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payment }));
      saveSubject.complete();

      // THEN
      expect(paymentFormService.getPayment).toHaveBeenCalled();
      expect(paymentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      jest.spyOn(paymentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paymentService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareMembershipAdmission', () => {
      it('should forward to membershipAdmissionService', () => {
        const entity = { id: 32173 };
        const entity2 = { id: 35 };
        jest.spyOn(membershipAdmissionService, 'compareMembershipAdmission');
        comp.compareMembershipAdmission(entity, entity2);
        expect(membershipAdmissionService.compareMembershipAdmission).toHaveBeenCalledWith(entity, entity2);
      });
    });

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
