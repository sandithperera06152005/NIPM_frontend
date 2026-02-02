import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../advanced-level-subject.test-samples';

import { AdvancedLevelSubjectService } from './advanced-level-subject.service';

const requireRestSample: IAdvancedLevelSubject = {
  ...sampleWithRequiredData,
};

describe('AdvancedLevelSubject Service', () => {
  let service: AdvancedLevelSubjectService;
  let httpMock: HttpTestingController;
  let expectedResult: IAdvancedLevelSubject | IAdvancedLevelSubject[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AdvancedLevelSubjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a AdvancedLevelSubject', () => {
      const advancedLevelSubject = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(advancedLevelSubject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AdvancedLevelSubject', () => {
      const advancedLevelSubject = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(advancedLevelSubject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AdvancedLevelSubject', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AdvancedLevelSubject', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AdvancedLevelSubject', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a AdvancedLevelSubject', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addAdvancedLevelSubjectToCollectionIfMissing', () => {
      it('should add a AdvancedLevelSubject to an empty array', () => {
        const advancedLevelSubject: IAdvancedLevelSubject = sampleWithRequiredData;
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing([], advancedLevelSubject);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advancedLevelSubject);
      });

      it('should not add a AdvancedLevelSubject to an array that contains it', () => {
        const advancedLevelSubject: IAdvancedLevelSubject = sampleWithRequiredData;
        const advancedLevelSubjectCollection: IAdvancedLevelSubject[] = [
          {
            ...advancedLevelSubject,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing(advancedLevelSubjectCollection, advancedLevelSubject);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AdvancedLevelSubject to an array that doesn't contain it", () => {
        const advancedLevelSubject: IAdvancedLevelSubject = sampleWithRequiredData;
        const advancedLevelSubjectCollection: IAdvancedLevelSubject[] = [sampleWithPartialData];
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing(advancedLevelSubjectCollection, advancedLevelSubject);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advancedLevelSubject);
      });

      it('should add only unique AdvancedLevelSubject to an array', () => {
        const advancedLevelSubjectArray: IAdvancedLevelSubject[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const advancedLevelSubjectCollection: IAdvancedLevelSubject[] = [sampleWithRequiredData];
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing(advancedLevelSubjectCollection, ...advancedLevelSubjectArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const advancedLevelSubject: IAdvancedLevelSubject = sampleWithRequiredData;
        const advancedLevelSubject2: IAdvancedLevelSubject = sampleWithPartialData;
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing([], advancedLevelSubject, advancedLevelSubject2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advancedLevelSubject);
        expect(expectedResult).toContain(advancedLevelSubject2);
      });

      it('should accept null and undefined values', () => {
        const advancedLevelSubject: IAdvancedLevelSubject = sampleWithRequiredData;
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing([], null, advancedLevelSubject, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advancedLevelSubject);
      });

      it('should return initial array if no AdvancedLevelSubject is added', () => {
        const advancedLevelSubjectCollection: IAdvancedLevelSubject[] = [sampleWithRequiredData];
        expectedResult = service.addAdvancedLevelSubjectToCollectionIfMissing(advancedLevelSubjectCollection, undefined, null);
        expect(expectedResult).toEqual(advancedLevelSubjectCollection);
      });
    });

    describe('compareAdvancedLevelSubject', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAdvancedLevelSubject(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 21506 };
        const entity2 = null;

        const compareResult1 = service.compareAdvancedLevelSubject(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelSubject(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 21506 };
        const entity2 = { id: 28585 };

        const compareResult1 = service.compareAdvancedLevelSubject(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelSubject(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 21506 };
        const entity2 = { id: 21506 };

        const compareResult1 = service.compareAdvancedLevelSubject(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelSubject(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
