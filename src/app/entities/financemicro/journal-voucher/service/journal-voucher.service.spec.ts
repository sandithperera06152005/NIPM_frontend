import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IJournalVoucher } from '../journal-voucher.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../journal-voucher.test-samples';

import { JournalVoucherService, RestJournalVoucher } from './journal-voucher.service';

const requireRestSample: RestJournalVoucher = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.toJSON(),
};

describe('JournalVoucher Service', () => {
  let service: JournalVoucherService;
  let httpMock: HttpTestingController;
  let expectedResult: IJournalVoucher | IJournalVoucher[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(JournalVoucherService);
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

    it('should create a JournalVoucher', () => {
      const journalVoucher = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(journalVoucher).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a JournalVoucher', () => {
      const journalVoucher = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(journalVoucher).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a JournalVoucher', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of JournalVoucher', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a JournalVoucher', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addJournalVoucherToCollectionIfMissing', () => {
      it('should add a JournalVoucher to an empty array', () => {
        const journalVoucher: IJournalVoucher = sampleWithRequiredData;
        expectedResult = service.addJournalVoucherToCollectionIfMissing([], journalVoucher);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(journalVoucher);
      });

      it('should not add a JournalVoucher to an array that contains it', () => {
        const journalVoucher: IJournalVoucher = sampleWithRequiredData;
        const journalVoucherCollection: IJournalVoucher[] = [
          {
            ...journalVoucher,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addJournalVoucherToCollectionIfMissing(journalVoucherCollection, journalVoucher);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a JournalVoucher to an array that doesn't contain it", () => {
        const journalVoucher: IJournalVoucher = sampleWithRequiredData;
        const journalVoucherCollection: IJournalVoucher[] = [sampleWithPartialData];
        expectedResult = service.addJournalVoucherToCollectionIfMissing(journalVoucherCollection, journalVoucher);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(journalVoucher);
      });

      it('should add only unique JournalVoucher to an array', () => {
        const journalVoucherArray: IJournalVoucher[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const journalVoucherCollection: IJournalVoucher[] = [sampleWithRequiredData];
        expectedResult = service.addJournalVoucherToCollectionIfMissing(journalVoucherCollection, ...journalVoucherArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const journalVoucher: IJournalVoucher = sampleWithRequiredData;
        const journalVoucher2: IJournalVoucher = sampleWithPartialData;
        expectedResult = service.addJournalVoucherToCollectionIfMissing([], journalVoucher, journalVoucher2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(journalVoucher);
        expect(expectedResult).toContain(journalVoucher2);
      });

      it('should accept null and undefined values', () => {
        const journalVoucher: IJournalVoucher = sampleWithRequiredData;
        expectedResult = service.addJournalVoucherToCollectionIfMissing([], null, journalVoucher, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(journalVoucher);
      });

      it('should return initial array if no JournalVoucher is added', () => {
        const journalVoucherCollection: IJournalVoucher[] = [sampleWithRequiredData];
        expectedResult = service.addJournalVoucherToCollectionIfMissing(journalVoucherCollection, undefined, null);
        expect(expectedResult).toEqual(journalVoucherCollection);
      });
    });

    describe('compareJournalVoucher', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareJournalVoucher(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 14827 };
        const entity2 = null;

        const compareResult1 = service.compareJournalVoucher(entity1, entity2);
        const compareResult2 = service.compareJournalVoucher(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 14827 };
        const entity2 = { id: 17663 };

        const compareResult1 = service.compareJournalVoucher(entity1, entity2);
        const compareResult2 = service.compareJournalVoucher(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 14827 };
        const entity2 = { id: 14827 };

        const compareResult1 = service.compareJournalVoucher(entity1, entity2);
        const compareResult2 = service.compareJournalVoucher(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
