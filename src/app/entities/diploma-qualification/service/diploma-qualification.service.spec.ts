import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IDiplomaQualification } from '../diploma-qualification.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../diploma-qualification.test-samples';

import { DiplomaQualificationService, RestDiplomaQualification } from './diploma-qualification.service';

const requireRestSample: RestDiplomaQualification = {
  ...sampleWithRequiredData,
  effectiveDate: sampleWithRequiredData.effectiveDate?.format(DATE_FORMAT),
};

describe('DiplomaQualification Service', () => {
  let service: DiplomaQualificationService;
  let httpMock: HttpTestingController;
  let expectedResult: IDiplomaQualification | IDiplomaQualification[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(DiplomaQualificationService);
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

    it('should create a DiplomaQualification', () => {
      const diplomaQualification = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(diplomaQualification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DiplomaQualification', () => {
      const diplomaQualification = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(diplomaQualification).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DiplomaQualification', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DiplomaQualification', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DiplomaQualification', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a DiplomaQualification', () => {
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

    describe('addDiplomaQualificationToCollectionIfMissing', () => {
      it('should add a DiplomaQualification to an empty array', () => {
        const diplomaQualification: IDiplomaQualification = sampleWithRequiredData;
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing([], diplomaQualification);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(diplomaQualification);
      });

      it('should not add a DiplomaQualification to an array that contains it', () => {
        const diplomaQualification: IDiplomaQualification = sampleWithRequiredData;
        const diplomaQualificationCollection: IDiplomaQualification[] = [
          {
            ...diplomaQualification,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing(diplomaQualificationCollection, diplomaQualification);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DiplomaQualification to an array that doesn't contain it", () => {
        const diplomaQualification: IDiplomaQualification = sampleWithRequiredData;
        const diplomaQualificationCollection: IDiplomaQualification[] = [sampleWithPartialData];
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing(diplomaQualificationCollection, diplomaQualification);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(diplomaQualification);
      });

      it('should add only unique DiplomaQualification to an array', () => {
        const diplomaQualificationArray: IDiplomaQualification[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const diplomaQualificationCollection: IDiplomaQualification[] = [sampleWithRequiredData];
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing(diplomaQualificationCollection, ...diplomaQualificationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const diplomaQualification: IDiplomaQualification = sampleWithRequiredData;
        const diplomaQualification2: IDiplomaQualification = sampleWithPartialData;
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing([], diplomaQualification, diplomaQualification2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(diplomaQualification);
        expect(expectedResult).toContain(diplomaQualification2);
      });

      it('should accept null and undefined values', () => {
        const diplomaQualification: IDiplomaQualification = sampleWithRequiredData;
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing([], null, diplomaQualification, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(diplomaQualification);
      });

      it('should return initial array if no DiplomaQualification is added', () => {
        const diplomaQualificationCollection: IDiplomaQualification[] = [sampleWithRequiredData];
        expectedResult = service.addDiplomaQualificationToCollectionIfMissing(diplomaQualificationCollection, undefined, null);
        expect(expectedResult).toEqual(diplomaQualificationCollection);
      });
    });

    describe('compareDiplomaQualification', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDiplomaQualification(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 25116 };
        const entity2 = null;

        const compareResult1 = service.compareDiplomaQualification(entity1, entity2);
        const compareResult2 = service.compareDiplomaQualification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 25116 };
        const entity2 = { id: 7238 };

        const compareResult1 = service.compareDiplomaQualification(entity1, entity2);
        const compareResult2 = service.compareDiplomaQualification(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 25116 };
        const entity2 = { id: 25116 };

        const compareResult1 = service.compareDiplomaQualification(entity1, entity2);
        const compareResult2 = service.compareDiplomaQualification(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
