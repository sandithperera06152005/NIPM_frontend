import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IVendorPayments } from '../vendor-payments.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../vendor-payments.test-samples';

import { RestVendorPayments, VendorPaymentsService } from './vendor-payments.service';

const requireRestSample: RestVendorPayments = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.toJSON(),
  lmd: sampleWithRequiredData.lmd?.toJSON(),
};

describe('VendorPayments Service', () => {
  let service: VendorPaymentsService;
  let httpMock: HttpTestingController;
  let expectedResult: IVendorPayments | IVendorPayments[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(VendorPaymentsService);
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

    it('should create a VendorPayments', () => {
      const vendorPayments = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(vendorPayments).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a VendorPayments', () => {
      const vendorPayments = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(vendorPayments).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a VendorPayments', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of VendorPayments', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a VendorPayments', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addVendorPaymentsToCollectionIfMissing', () => {
      it('should add a VendorPayments to an empty array', () => {
        const vendorPayments: IVendorPayments = sampleWithRequiredData;
        expectedResult = service.addVendorPaymentsToCollectionIfMissing([], vendorPayments);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(vendorPayments);
      });

      it('should not add a VendorPayments to an array that contains it', () => {
        const vendorPayments: IVendorPayments = sampleWithRequiredData;
        const vendorPaymentsCollection: IVendorPayments[] = [
          {
            ...vendorPayments,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addVendorPaymentsToCollectionIfMissing(vendorPaymentsCollection, vendorPayments);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a VendorPayments to an array that doesn't contain it", () => {
        const vendorPayments: IVendorPayments = sampleWithRequiredData;
        const vendorPaymentsCollection: IVendorPayments[] = [sampleWithPartialData];
        expectedResult = service.addVendorPaymentsToCollectionIfMissing(vendorPaymentsCollection, vendorPayments);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(vendorPayments);
      });

      it('should add only unique VendorPayments to an array', () => {
        const vendorPaymentsArray: IVendorPayments[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const vendorPaymentsCollection: IVendorPayments[] = [sampleWithRequiredData];
        expectedResult = service.addVendorPaymentsToCollectionIfMissing(vendorPaymentsCollection, ...vendorPaymentsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const vendorPayments: IVendorPayments = sampleWithRequiredData;
        const vendorPayments2: IVendorPayments = sampleWithPartialData;
        expectedResult = service.addVendorPaymentsToCollectionIfMissing([], vendorPayments, vendorPayments2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(vendorPayments);
        expect(expectedResult).toContain(vendorPayments2);
      });

      it('should accept null and undefined values', () => {
        const vendorPayments: IVendorPayments = sampleWithRequiredData;
        expectedResult = service.addVendorPaymentsToCollectionIfMissing([], null, vendorPayments, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(vendorPayments);
      });

      it('should return initial array if no VendorPayments is added', () => {
        const vendorPaymentsCollection: IVendorPayments[] = [sampleWithRequiredData];
        expectedResult = service.addVendorPaymentsToCollectionIfMissing(vendorPaymentsCollection, undefined, null);
        expect(expectedResult).toEqual(vendorPaymentsCollection);
      });
    });

    describe('compareVendorPayments', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareVendorPayments(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 20190 };
        const entity2 = null;

        const compareResult1 = service.compareVendorPayments(entity1, entity2);
        const compareResult2 = service.compareVendorPayments(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 20190 };
        const entity2 = { id: 8632 };

        const compareResult1 = service.compareVendorPayments(entity1, entity2);
        const compareResult2 = service.compareVendorPayments(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 20190 };
        const entity2 = { id: 20190 };

        const compareResult1 = service.compareVendorPayments(entity1, entity2);
        const compareResult2 = service.compareVendorPayments(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
