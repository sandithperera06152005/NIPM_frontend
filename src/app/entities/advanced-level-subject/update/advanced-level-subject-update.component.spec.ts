import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IAdvancedLevelQualification } from 'app/entities/advanced-level-qualification/advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { AdvancedLevelSubjectService } from '../service/advanced-level-subject.service';
import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import { AdvancedLevelSubjectFormService } from './advanced-level-subject-form.service';

import { AdvancedLevelSubjectUpdateComponent } from './advanced-level-subject-update.component';

describe('AdvancedLevelSubject Management Update Component', () => {
  let comp: AdvancedLevelSubjectUpdateComponent;
  let fixture: ComponentFixture<AdvancedLevelSubjectUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let advancedLevelSubjectFormService: AdvancedLevelSubjectFormService;
  let advancedLevelSubjectService: AdvancedLevelSubjectService;
  let advancedLevelQualificationService: AdvancedLevelQualificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdvancedLevelSubjectUpdateComponent],
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
      .overrideTemplate(AdvancedLevelSubjectUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AdvancedLevelSubjectUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    advancedLevelSubjectFormService = TestBed.inject(AdvancedLevelSubjectFormService);
    advancedLevelSubjectService = TestBed.inject(AdvancedLevelSubjectService);
    advancedLevelQualificationService = TestBed.inject(AdvancedLevelQualificationService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call AdvancedLevelQualification query and add missing value', () => {
      const advancedLevelSubject: IAdvancedLevelSubject = { id: 28585 };
      const advancedLevelQualification: IAdvancedLevelQualification = { id: 31324 };
      advancedLevelSubject.advancedLevelQualification = advancedLevelQualification;

      const advancedLevelQualificationCollection: IAdvancedLevelQualification[] = [{ id: 31324 }];
      jest
        .spyOn(advancedLevelQualificationService, 'query')
        .mockReturnValue(of(new HttpResponse({ body: advancedLevelQualificationCollection })));
      const additionalAdvancedLevelQualifications = [advancedLevelQualification];
      const expectedCollection: IAdvancedLevelQualification[] = [
        ...additionalAdvancedLevelQualifications,
        ...advancedLevelQualificationCollection,
      ];
      jest
        .spyOn(advancedLevelQualificationService, 'addAdvancedLevelQualificationToCollectionIfMissing')
        .mockReturnValue(expectedCollection);

      activatedRoute.data = of({ advancedLevelSubject });
      comp.ngOnInit();

      expect(advancedLevelQualificationService.query).toHaveBeenCalled();
      expect(advancedLevelQualificationService.addAdvancedLevelQualificationToCollectionIfMissing).toHaveBeenCalledWith(
        advancedLevelQualificationCollection,
        ...additionalAdvancedLevelQualifications.map(expect.objectContaining),
      );
      expect(comp.advancedLevelQualificationsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const advancedLevelSubject: IAdvancedLevelSubject = { id: 28585 };
      const advancedLevelQualification: IAdvancedLevelQualification = { id: 31324 };
      advancedLevelSubject.advancedLevelQualification = advancedLevelQualification;

      activatedRoute.data = of({ advancedLevelSubject });
      comp.ngOnInit();

      expect(comp.advancedLevelQualificationsSharedCollection).toContainEqual(advancedLevelQualification);
      expect(comp.advancedLevelSubject).toEqual(advancedLevelSubject);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelSubject>>();
      const advancedLevelSubject = { id: 21506 };
      jest.spyOn(advancedLevelSubjectFormService, 'getAdvancedLevelSubject').mockReturnValue(advancedLevelSubject);
      jest.spyOn(advancedLevelSubjectService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelSubject });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advancedLevelSubject }));
      saveSubject.complete();

      // THEN
      expect(advancedLevelSubjectFormService.getAdvancedLevelSubject).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(advancedLevelSubjectService.update).toHaveBeenCalledWith(expect.objectContaining(advancedLevelSubject));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelSubject>>();
      const advancedLevelSubject = { id: 21506 };
      jest.spyOn(advancedLevelSubjectFormService, 'getAdvancedLevelSubject').mockReturnValue({ id: null });
      jest.spyOn(advancedLevelSubjectService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelSubject: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advancedLevelSubject }));
      saveSubject.complete();

      // THEN
      expect(advancedLevelSubjectFormService.getAdvancedLevelSubject).toHaveBeenCalled();
      expect(advancedLevelSubjectService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvancedLevelSubject>>();
      const advancedLevelSubject = { id: 21506 };
      jest.spyOn(advancedLevelSubjectService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advancedLevelSubject });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(advancedLevelSubjectService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareAdvancedLevelQualification', () => {
      it('should forward to advancedLevelQualificationService', () => {
        const entity = { id: 31324 };
        const entity2 = { id: 13830 };
        jest.spyOn(advancedLevelQualificationService, 'compareAdvancedLevelQualification');
        comp.compareAdvancedLevelQualification(entity, entity2);
        expect(advancedLevelQualificationService.compareAdvancedLevelQualification).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
