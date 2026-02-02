import { TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import { AdvancedLevelSubjectService } from '../service/advanced-level-subject.service';

import advancedLevelSubjectResolve from './advanced-level-subject-routing-resolve.service';

describe('AdvancedLevelSubject routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let service: AdvancedLevelSubjectService;
  let resultAdvancedLevelSubject: IAdvancedLevelSubject | null | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    service = TestBed.inject(AdvancedLevelSubjectService);
    resultAdvancedLevelSubject = undefined;
  });

  describe('resolve', () => {
    it('should return IAdvancedLevelSubject returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      TestBed.runInInjectionContext(() => {
        advancedLevelSubjectResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultAdvancedLevelSubject = result;
          },
        });
      });

      // THEN
      expect(service.find).toHaveBeenCalledWith(123);
      expect(resultAdvancedLevelSubject).toEqual({ id: 123 });
    });

    it('should return null if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      TestBed.runInInjectionContext(() => {
        advancedLevelSubjectResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultAdvancedLevelSubject = result;
          },
        });
      });

      // THEN
      expect(service.find).not.toHaveBeenCalled();
      expect(resultAdvancedLevelSubject).toEqual(null);
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<IAdvancedLevelSubject>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      TestBed.runInInjectionContext(() => {
        advancedLevelSubjectResolve(mockActivatedRouteSnapshot).subscribe({
          next(result) {
            resultAdvancedLevelSubject = result;
          },
        });
      });

      // THEN
      expect(service.find).toHaveBeenCalledWith(123);
      expect(resultAdvancedLevelSubject).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
