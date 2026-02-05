import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, map, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { IApplicant, NewApplicant } from '../applicant.model';

export type PartialUpdateApplicant = Partial<IApplicant> & Pick<IApplicant, 'id'>;

type RestOf<T extends IApplicant | NewApplicant> = Omit<T, 'dateOfBirth'> & {
  dateOfBirth?: string | null;
};

export type RestApplicant = RestOf<IApplicant>;

export type NewRestApplicant = RestOf<NewApplicant>;

export type PartialUpdateRestApplicant = RestOf<PartialUpdateApplicant>;

export type EntityResponseType = HttpResponse<IApplicant>;
export type EntityArrayResponseType = HttpResponse<IApplicant[]>;

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/applicants');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/applicants/_search');

  create(applicant: NewApplicant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(applicant);
    return this.http
      .post<RestApplicant>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(applicant: IApplicant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(applicant);
    return this.http
      .put<RestApplicant>(`${this.resourceUrl}/${this.getApplicantIdentifier(applicant)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(applicant: PartialUpdateApplicant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(applicant);
    return this.http
      .patch<RestApplicant>(`${this.resourceUrl}/${this.getApplicantIdentifier(applicant)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestApplicant>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestApplicant[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestApplicant[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IApplicant[]>()], asapScheduler)),
    );
  }

  getApplicantIdentifier(applicant: Pick<IApplicant, 'id'>): number {
    return applicant.id;
  }

  compareApplicant(o1: Pick<IApplicant, 'id'> | null, o2: Pick<IApplicant, 'id'> | null): boolean {
    return o1 && o2 ? this.getApplicantIdentifier(o1) === this.getApplicantIdentifier(o2) : o1 === o2;
  }

  addApplicantToCollectionIfMissing<Type extends Pick<IApplicant, 'id'>>(
    applicantCollection: Type[],
    ...applicantsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const applicants: Type[] = applicantsToCheck.filter(isPresent);
    if (applicants.length > 0) {
      const applicantCollectionIdentifiers = applicantCollection.map(applicantItem => this.getApplicantIdentifier(applicantItem));
      const applicantsToAdd = applicants.filter(applicantItem => {
        const applicantIdentifier = this.getApplicantIdentifier(applicantItem);
        if (applicantCollectionIdentifiers.includes(applicantIdentifier)) {
          return false;
        }
        applicantCollectionIdentifiers.push(applicantIdentifier);
        return true;
      });
      return [...applicantsToAdd, ...applicantCollection];
    }
    return applicantCollection;
  }

  protected convertDateFromClient<
    T extends IApplicant | NewApplicant | PartialUpdateApplicant>(applicant: T): RestOf<T> {
    return {
      ...applicant,
      dateOfBirth: applicant.dateOfBirth
        ? dayjs(applicant.dateOfBirth as any).format(DATE_FORMAT)
        : null,
    };
  }

  protected convertDateFromServer(restApplicant: RestApplicant): IApplicant {
    return {
      ...restApplicant,
      dateOfBirth: restApplicant.dateOfBirth ? dayjs(restApplicant.dateOfBirth) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestApplicant>): HttpResponse<IApplicant> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestApplicant[]>): HttpResponse<IApplicant[]> {
    const totalItems = res.headers.get('X-Total-count');
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
      headers: totalItems ? res.headers.set('X-Total-count', totalItems) : res.headers,

    });
  }
}
