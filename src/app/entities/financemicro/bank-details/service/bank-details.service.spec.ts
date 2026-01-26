import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IBankDetails } from '../bank-details.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../bank-details.test-samples';

import { BankDetailsService, RestBankDetails } from './bank-details.service';

const requireRestSample: RestBankDetails = {
  ...sampleWithRequiredData,
  lmd: sampleWithRequiredData.lmd?.toJSON(),
};

describe('BankDetails Service', () => {
  let service: BankDetailsService;
  let httpMock: HttpTestingController;
  let expectedResult: IBankDetails | IBankDetails[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(BankDetailsService);
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

    it('should create a BankDetails', () => {
      const bankDetails = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(bankDetails).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a BankDetails', () => {
      const bankDetails = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(bankDetails).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a BankDetails', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of BankDetails', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a BankDetails', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a BankDetails', () => {
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

    describe('addBankDetailsToCollectionIfMissing', () => {
      it('should add a BankDetails to an empty array', () => {
        const bankDetails: IBankDetails = sampleWithRequiredData;
        expectedResult = service.addBankDetailsToCollectionIfMissing([], bankDetails);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(bankDetails);
      });

      it('should not add a BankDetails to an array that contains it', () => {
        const bankDetails: IBankDetails = sampleWithRequiredData;
        const bankDetailsCollection: IBankDetails[] = [
          {
            ...bankDetails,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addBankDetailsToCollectionIfMissing(bankDetailsCollection, bankDetails);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a BankDetails to an array that doesn't contain it", () => {
        const bankDetails: IBankDetails = sampleWithRequiredData;
        const bankDetailsCollection: IBankDetails[] = [sampleWithPartialData];
        expectedResult = service.addBankDetailsToCollectionIfMissing(bankDetailsCollection, bankDetails);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(bankDetails);
      });

      it('should add only unique BankDetails to an array', () => {
        const bankDetailsArray: IBankDetails[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const bankDetailsCollection: IBankDetails[] = [sampleWithRequiredData];
        expectedResult = service.addBankDetailsToCollectionIfMissing(bankDetailsCollection, ...bankDetailsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const bankDetails: IBankDetails = sampleWithRequiredData;
        const bankDetails2: IBankDetails = sampleWithPartialData;
        expectedResult = service.addBankDetailsToCollectionIfMissing([], bankDetails, bankDetails2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(bankDetails);
        expect(expectedResult).toContain(bankDetails2);
      });

      it('should accept null and undefined values', () => {
        const bankDetails: IBankDetails = sampleWithRequiredData;
        expectedResult = service.addBankDetailsToCollectionIfMissing([], null, bankDetails, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(bankDetails);
      });

      it('should return initial array if no BankDetails is added', () => {
        const bankDetailsCollection: IBankDetails[] = [sampleWithRequiredData];
        expectedResult = service.addBankDetailsToCollectionIfMissing(bankDetailsCollection, undefined, null);
        expect(expectedResult).toEqual(bankDetailsCollection);
      });
    });

    describe('compareBankDetails', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareBankDetails(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7814 };
        const entity2 = null;

        const compareResult1 = service.compareBankDetails(entity1, entity2);
        const compareResult2 = service.compareBankDetails(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7814 };
        const entity2 = { id: 15871 };

        const compareResult1 = service.compareBankDetails(entity1, entity2);
        const compareResult2 = service.compareBankDetails(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7814 };
        const entity2 = { id: 7814 };

        const compareResult1 = service.compareBankDetails(entity1, entity2);
        const compareResult2 = service.compareBankDetails(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
