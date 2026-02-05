import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IEmployment } from '../employment.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../employment.test-samples';

import { EmploymentService } from './employment.service';

const requireRestSample: IEmployment = {
  ...sampleWithRequiredData,
};

describe('Employment Service', () => {
  let service: EmploymentService;
  let httpMock: HttpTestingController;
  let expectedResult: IEmployment | IEmployment[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(EmploymentService);
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

    it('should create a Employment', () => {
      const employment = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(employment).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Employment', () => {
      const employment = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(employment).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Employment', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Employment', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Employment', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Employment', () => {
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

    describe('addEmploymentToCollectionIfMissing', () => {
      it('should add a Employment to an empty array', () => {
        const employment: IEmployment = sampleWithRequiredData;
        expectedResult = service.addEmploymentToCollectionIfMissing([], employment);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employment);
      });

      it('should not add a Employment to an array that contains it', () => {
        const employment: IEmployment = sampleWithRequiredData;
        const employmentCollection: IEmployment[] = [
          {
            ...employment,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addEmploymentToCollectionIfMissing(employmentCollection, employment);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Employment to an array that doesn't contain it", () => {
        const employment: IEmployment = sampleWithRequiredData;
        const employmentCollection: IEmployment[] = [sampleWithPartialData];
        expectedResult = service.addEmploymentToCollectionIfMissing(employmentCollection, employment);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employment);
      });

      it('should add only unique Employment to an array', () => {
        const employmentArray: IEmployment[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const employmentCollection: IEmployment[] = [sampleWithRequiredData];
        expectedResult = service.addEmploymentToCollectionIfMissing(employmentCollection, ...employmentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const employment: IEmployment = sampleWithRequiredData;
        const employment2: IEmployment = sampleWithPartialData;
        expectedResult = service.addEmploymentToCollectionIfMissing([], employment, employment2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employment);
        expect(expectedResult).toContain(employment2);
      });

      it('should accept null and undefined values', () => {
        const employment: IEmployment = sampleWithRequiredData;
        expectedResult = service.addEmploymentToCollectionIfMissing([], null, employment, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employment);
      });

      it('should return initial array if no Employment is added', () => {
        const employmentCollection: IEmployment[] = [sampleWithRequiredData];
        expectedResult = service.addEmploymentToCollectionIfMissing(employmentCollection, undefined, null);
        expect(expectedResult).toEqual(employmentCollection);
      });
    });

    describe('compareEmployment', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareEmployment(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 30829 };
        const entity2 = null;

        const compareResult1 = service.compareEmployment(entity1, entity2);
        const compareResult2 = service.compareEmployment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 30829 };
        const entity2 = { id: 21536 };

        const compareResult1 = service.compareEmployment(entity1, entity2);
        const compareResult2 = service.compareEmployment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 30829 };
        const entity2 = { id: 30829 };

        const compareResult1 = service.compareEmployment(entity1, entity2);
        const compareResult2 = service.compareEmployment(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
