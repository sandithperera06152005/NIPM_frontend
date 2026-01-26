import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IChequeRegistry } from '../cheque-registry.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../cheque-registry.test-samples';

import { ChequeRegistryService, RestChequeRegistry } from './cheque-registry.service';

const requireRestSample: RestChequeRegistry = {
  ...sampleWithRequiredData,
  chequeDate: sampleWithRequiredData.chequeDate?.toJSON(),
  depositedDate: sampleWithRequiredData.depositedDate?.toJSON(),
  lmd: sampleWithRequiredData.lmd?.toJSON(),
};

describe('ChequeRegistry Service', () => {
  let service: ChequeRegistryService;
  let httpMock: HttpTestingController;
  let expectedResult: IChequeRegistry | IChequeRegistry[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ChequeRegistryService);
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

    it('should create a ChequeRegistry', () => {
      const chequeRegistry = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(chequeRegistry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ChequeRegistry', () => {
      const chequeRegistry = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(chequeRegistry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ChequeRegistry', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ChequeRegistry', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ChequeRegistry', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addChequeRegistryToCollectionIfMissing', () => {
      it('should add a ChequeRegistry to an empty array', () => {
        const chequeRegistry: IChequeRegistry = sampleWithRequiredData;
        expectedResult = service.addChequeRegistryToCollectionIfMissing([], chequeRegistry);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chequeRegistry);
      });

      it('should not add a ChequeRegistry to an array that contains it', () => {
        const chequeRegistry: IChequeRegistry = sampleWithRequiredData;
        const chequeRegistryCollection: IChequeRegistry[] = [
          {
            ...chequeRegistry,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addChequeRegistryToCollectionIfMissing(chequeRegistryCollection, chequeRegistry);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ChequeRegistry to an array that doesn't contain it", () => {
        const chequeRegistry: IChequeRegistry = sampleWithRequiredData;
        const chequeRegistryCollection: IChequeRegistry[] = [sampleWithPartialData];
        expectedResult = service.addChequeRegistryToCollectionIfMissing(chequeRegistryCollection, chequeRegistry);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chequeRegistry);
      });

      it('should add only unique ChequeRegistry to an array', () => {
        const chequeRegistryArray: IChequeRegistry[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const chequeRegistryCollection: IChequeRegistry[] = [sampleWithRequiredData];
        expectedResult = service.addChequeRegistryToCollectionIfMissing(chequeRegistryCollection, ...chequeRegistryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const chequeRegistry: IChequeRegistry = sampleWithRequiredData;
        const chequeRegistry2: IChequeRegistry = sampleWithPartialData;
        expectedResult = service.addChequeRegistryToCollectionIfMissing([], chequeRegistry, chequeRegistry2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(chequeRegistry);
        expect(expectedResult).toContain(chequeRegistry2);
      });

      it('should accept null and undefined values', () => {
        const chequeRegistry: IChequeRegistry = sampleWithRequiredData;
        expectedResult = service.addChequeRegistryToCollectionIfMissing([], null, chequeRegistry, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(chequeRegistry);
      });

      it('should return initial array if no ChequeRegistry is added', () => {
        const chequeRegistryCollection: IChequeRegistry[] = [sampleWithRequiredData];
        expectedResult = service.addChequeRegistryToCollectionIfMissing(chequeRegistryCollection, undefined, null);
        expect(expectedResult).toEqual(chequeRegistryCollection);
      });
    });

    describe('compareChequeRegistry', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareChequeRegistry(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28975 };
        const entity2 = null;

        const compareResult1 = service.compareChequeRegistry(entity1, entity2);
        const compareResult2 = service.compareChequeRegistry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28975 };
        const entity2 = { id: 30709 };

        const compareResult1 = service.compareChequeRegistry(entity1, entity2);
        const compareResult2 = service.compareChequeRegistry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28975 };
        const entity2 = { id: 28975 };

        const compareResult1 = service.compareChequeRegistry(entity1, entity2);
        const compareResult2 = service.compareChequeRegistry(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
