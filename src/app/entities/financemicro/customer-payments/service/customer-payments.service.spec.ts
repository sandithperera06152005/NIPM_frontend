import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ICustomerPayments } from '../customer-payments.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../customer-payments.test-samples';

import { CustomerPaymentsService, RestCustomerPayments } from './customer-payments.service';

const requireRestSample: RestCustomerPayments = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.toJSON(),
  lmd: sampleWithRequiredData.lmd?.toJSON(),
};

describe('CustomerPayments Service', () => {
  let service: CustomerPaymentsService;
  let httpMock: HttpTestingController;
  let expectedResult: ICustomerPayments | ICustomerPayments[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(CustomerPaymentsService);
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

    it('should create a CustomerPayments', () => {
      const customerPayments = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(customerPayments).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CustomerPayments', () => {
      const customerPayments = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(customerPayments).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CustomerPayments', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CustomerPayments', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a CustomerPayments', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a CustomerPayments', () => {
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

    describe('addCustomerPaymentsToCollectionIfMissing', () => {
      it('should add a CustomerPayments to an empty array', () => {
        const customerPayments: ICustomerPayments = sampleWithRequiredData;
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing([], customerPayments);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(customerPayments);
      });

      it('should not add a CustomerPayments to an array that contains it', () => {
        const customerPayments: ICustomerPayments = sampleWithRequiredData;
        const customerPaymentsCollection: ICustomerPayments[] = [
          {
            ...customerPayments,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing(customerPaymentsCollection, customerPayments);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CustomerPayments to an array that doesn't contain it", () => {
        const customerPayments: ICustomerPayments = sampleWithRequiredData;
        const customerPaymentsCollection: ICustomerPayments[] = [sampleWithPartialData];
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing(customerPaymentsCollection, customerPayments);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(customerPayments);
      });

      it('should add only unique CustomerPayments to an array', () => {
        const customerPaymentsArray: ICustomerPayments[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const customerPaymentsCollection: ICustomerPayments[] = [sampleWithRequiredData];
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing(customerPaymentsCollection, ...customerPaymentsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const customerPayments: ICustomerPayments = sampleWithRequiredData;
        const customerPayments2: ICustomerPayments = sampleWithPartialData;
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing([], customerPayments, customerPayments2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(customerPayments);
        expect(expectedResult).toContain(customerPayments2);
      });

      it('should accept null and undefined values', () => {
        const customerPayments: ICustomerPayments = sampleWithRequiredData;
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing([], null, customerPayments, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(customerPayments);
      });

      it('should return initial array if no CustomerPayments is added', () => {
        const customerPaymentsCollection: ICustomerPayments[] = [sampleWithRequiredData];
        expectedResult = service.addCustomerPaymentsToCollectionIfMissing(customerPaymentsCollection, undefined, null);
        expect(expectedResult).toEqual(customerPaymentsCollection);
      });
    });

    describe('compareCustomerPayments', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareCustomerPayments(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 526 };
        const entity2 = null;

        const compareResult1 = service.compareCustomerPayments(entity1, entity2);
        const compareResult2 = service.compareCustomerPayments(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 526 };
        const entity2 = { id: 18404 };

        const compareResult1 = service.compareCustomerPayments(entity1, entity2);
        const compareResult2 = service.compareCustomerPayments(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 526 };
        const entity2 = { id: 526 };

        const compareResult1 = service.compareCustomerPayments(entity1, entity2);
        const compareResult2 = service.compareCustomerPayments(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
