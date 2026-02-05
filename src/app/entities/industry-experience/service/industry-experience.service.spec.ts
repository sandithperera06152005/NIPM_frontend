import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IIndustryExperience } from '../industry-experience.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../industry-experience.test-samples';

import { IndustryExperienceService, RestIndustryExperience } from './industry-experience.service';

const requireRestSample: RestIndustryExperience = {
  ...sampleWithRequiredData,
  fromDate: sampleWithRequiredData.fromDate?.format(DATE_FORMAT),
  toDate: sampleWithRequiredData.toDate?.format(DATE_FORMAT),
};

describe('IndustryExperience Service', () => {
  let service: IndustryExperienceService;
  let httpMock: HttpTestingController;
  let expectedResult: IIndustryExperience | IIndustryExperience[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(IndustryExperienceService);
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

    it('should create a IndustryExperience', () => {
      const industryExperience = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(industryExperience).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a IndustryExperience', () => {
      const industryExperience = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(industryExperience).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a IndustryExperience', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of IndustryExperience', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a IndustryExperience', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a IndustryExperience', () => {
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

    describe('addIndustryExperienceToCollectionIfMissing', () => {
      it('should add a IndustryExperience to an empty array', () => {
        const industryExperience: IIndustryExperience = sampleWithRequiredData;
        expectedResult = service.addIndustryExperienceToCollectionIfMissing([], industryExperience);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(industryExperience);
      });

      it('should not add a IndustryExperience to an array that contains it', () => {
        const industryExperience: IIndustryExperience = sampleWithRequiredData;
        const industryExperienceCollection: IIndustryExperience[] = [
          {
            ...industryExperience,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addIndustryExperienceToCollectionIfMissing(industryExperienceCollection, industryExperience);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a IndustryExperience to an array that doesn't contain it", () => {
        const industryExperience: IIndustryExperience = sampleWithRequiredData;
        const industryExperienceCollection: IIndustryExperience[] = [sampleWithPartialData];
        expectedResult = service.addIndustryExperienceToCollectionIfMissing(industryExperienceCollection, industryExperience);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(industryExperience);
      });

      it('should add only unique IndustryExperience to an array', () => {
        const industryExperienceArray: IIndustryExperience[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const industryExperienceCollection: IIndustryExperience[] = [sampleWithRequiredData];
        expectedResult = service.addIndustryExperienceToCollectionIfMissing(industryExperienceCollection, ...industryExperienceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const industryExperience: IIndustryExperience = sampleWithRequiredData;
        const industryExperience2: IIndustryExperience = sampleWithPartialData;
        expectedResult = service.addIndustryExperienceToCollectionIfMissing([], industryExperience, industryExperience2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(industryExperience);
        expect(expectedResult).toContain(industryExperience2);
      });

      it('should accept null and undefined values', () => {
        const industryExperience: IIndustryExperience = sampleWithRequiredData;
        expectedResult = service.addIndustryExperienceToCollectionIfMissing([], null, industryExperience, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(industryExperience);
      });

      it('should return initial array if no IndustryExperience is added', () => {
        const industryExperienceCollection: IIndustryExperience[] = [sampleWithRequiredData];
        expectedResult = service.addIndustryExperienceToCollectionIfMissing(industryExperienceCollection, undefined, null);
        expect(expectedResult).toEqual(industryExperienceCollection);
      });
    });

    describe('compareIndustryExperience', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareIndustryExperience(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 16525 };
        const entity2 = null;

        const compareResult1 = service.compareIndustryExperience(entity1, entity2);
        const compareResult2 = service.compareIndustryExperience(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 16525 };
        const entity2 = { id: 23337 };

        const compareResult1 = service.compareIndustryExperience(entity1, entity2);
        const compareResult2 = service.compareIndustryExperience(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 16525 };
        const entity2 = { id: 16525 };

        const compareResult1 = service.compareIndustryExperience(entity1, entity2);
        const compareResult2 = service.compareIndustryExperience(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
