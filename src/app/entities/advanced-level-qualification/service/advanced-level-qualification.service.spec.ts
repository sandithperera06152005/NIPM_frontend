import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../advanced-level-qualification.test-samples';

import { AdvancedLevelQualificationService } from './advanced-level-qualification.service';

const requireRestSample: IAdvancedLevelQualification = {
  ...sampleWithRequiredData,
};

describe('AdvancedLevelQualification Service', () => {
  let service: AdvancedLevelQualificationService;
  let httpMock: HttpTestingController;
  let expectedResult: IAdvancedLevelQualification | IAdvancedLevelQualification[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AdvancedLevelQualificationService);
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

    it('should create a AdvancedLevelQualification', () => {
      const advancedLevelQualification = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(advancedLevelQualification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AdvancedLevelQualification', () => {
      const advancedLevelQualification = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(advancedLevelQualification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AdvancedLevelQualification', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AdvancedLevelQualification', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AdvancedLevelQualification', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a AdvancedLevelQualification', () => {
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

    describe('addAdvancedLevelQualificationToCollectionIfMissing', () => {
      it('should add a AdvancedLevelQualification to an empty array', () => {
        const advancedLevelQualification: IAdvancedLevelQualification = sampleWithRequiredData;
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing([], advancedLevelQualification);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advancedLevelQualification);
      });

      it('should not add a AdvancedLevelQualification to an array that contains it', () => {
        const advancedLevelQualification: IAdvancedLevelQualification = sampleWithRequiredData;
        const advancedLevelQualificationCollection: IAdvancedLevelQualification[] = [
          {
            ...advancedLevelQualification,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing(
          advancedLevelQualificationCollection,
          advancedLevelQualification,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AdvancedLevelQualification to an array that doesn't contain it", () => {
        const advancedLevelQualification: IAdvancedLevelQualification = sampleWithRequiredData;
        const advancedLevelQualificationCollection: IAdvancedLevelQualification[] = [sampleWithPartialData];
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing(
          advancedLevelQualificationCollection,
          advancedLevelQualification,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advancedLevelQualification);
      });

      it('should add only unique AdvancedLevelQualification to an array', () => {
        const advancedLevelQualificationArray: IAdvancedLevelQualification[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const advancedLevelQualificationCollection: IAdvancedLevelQualification[] = [sampleWithRequiredData];
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing(
          advancedLevelQualificationCollection,
          ...advancedLevelQualificationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const advancedLevelQualification: IAdvancedLevelQualification = sampleWithRequiredData;
        const advancedLevelQualification2: IAdvancedLevelQualification = sampleWithPartialData;
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing(
          [],
          advancedLevelQualification,
          advancedLevelQualification2,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advancedLevelQualification);
        expect(expectedResult).toContain(advancedLevelQualification2);
      });

      it('should accept null and undefined values', () => {
        const advancedLevelQualification: IAdvancedLevelQualification = sampleWithRequiredData;
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing([], null, advancedLevelQualification, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advancedLevelQualification);
      });

      it('should return initial array if no AdvancedLevelQualification is added', () => {
        const advancedLevelQualificationCollection: IAdvancedLevelQualification[] = [sampleWithRequiredData];
        expectedResult = service.addAdvancedLevelQualificationToCollectionIfMissing(advancedLevelQualificationCollection, undefined, null);
        expect(expectedResult).toEqual(advancedLevelQualificationCollection);
      });
    });

    describe('compareAdvancedLevelQualification', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAdvancedLevelQualification(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 31324 };
        const entity2 = null;

        const compareResult1 = service.compareAdvancedLevelQualification(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelQualification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 31324 };
        const entity2 = { id: 13830 };

        const compareResult1 = service.compareAdvancedLevelQualification(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelQualification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 31324 };
        const entity2 = { id: 31324 };

        const compareResult1 = service.compareAdvancedLevelQualification(entity1, entity2);
        const compareResult2 = service.compareAdvancedLevelQualification(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
