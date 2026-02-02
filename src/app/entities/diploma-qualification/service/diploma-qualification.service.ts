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
import { IDiplomaQualification, NewDiplomaQualification } from '../diploma-qualification.model';

export type PartialUpdateDiplomaQualification = Partial<IDiplomaQualification> & Pick<IDiplomaQualification, 'id'>;

type RestOf<T extends IDiplomaQualification | NewDiplomaQualification> = Omit<T, 'effectiveDate'> & {
  effectiveDate?: string | null;
};

export type RestDiplomaQualification = RestOf<IDiplomaQualification>;

export type NewRestDiplomaQualification = RestOf<NewDiplomaQualification>;

export type PartialUpdateRestDiplomaQualification = RestOf<PartialUpdateDiplomaQualification>;

export type EntityResponseType = HttpResponse<IDiplomaQualification>;
export type EntityArrayResponseType = HttpResponse<IDiplomaQualification[]>;

@Injectable({ providedIn: 'root' })
export class DiplomaQualificationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/diploma-qualifications');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/diploma-qualifications/_search');

  create(diplomaQualification: NewDiplomaQualification): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(diplomaQualification);
    return this.http
      .post<RestDiplomaQualification>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(diplomaQualification: IDiplomaQualification): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(diplomaQualification);
    return this.http
      .put<RestDiplomaQualification>(`${this.resourceUrl}/${this.getDiplomaQualificationIdentifier(diplomaQualification)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(diplomaQualification: PartialUpdateDiplomaQualification): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(diplomaQualification);
    return this.http
      .patch<RestDiplomaQualification>(`${this.resourceUrl}/${this.getDiplomaQualificationIdentifier(diplomaQualification)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDiplomaQualification>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDiplomaQualification[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestDiplomaQualification[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IDiplomaQualification[]>()], asapScheduler)),
    );
  }

  getDiplomaQualificationIdentifier(diplomaQualification: Pick<IDiplomaQualification, 'id'>): number {
    return diplomaQualification.id;
  }

  compareDiplomaQualification(o1: Pick<IDiplomaQualification, 'id'> | null, o2: Pick<IDiplomaQualification, 'id'> | null): boolean {
    return o1 && o2 ? this.getDiplomaQualificationIdentifier(o1) === this.getDiplomaQualificationIdentifier(o2) : o1 === o2;
  }

  addDiplomaQualificationToCollectionIfMissing<Type extends Pick<IDiplomaQualification, 'id'>>(
    diplomaQualificationCollection: Type[],
    ...diplomaQualificationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const diplomaQualifications: Type[] = diplomaQualificationsToCheck.filter(isPresent);
    if (diplomaQualifications.length > 0) {
      const diplomaQualificationCollectionIdentifiers = diplomaQualificationCollection.map(diplomaQualificationItem =>
        this.getDiplomaQualificationIdentifier(diplomaQualificationItem),
      );
      const diplomaQualificationsToAdd = diplomaQualifications.filter(diplomaQualificationItem => {
        const diplomaQualificationIdentifier = this.getDiplomaQualificationIdentifier(diplomaQualificationItem);
        if (diplomaQualificationCollectionIdentifiers.includes(diplomaQualificationIdentifier)) {
          return false;
        }
        diplomaQualificationCollectionIdentifiers.push(diplomaQualificationIdentifier);
        return true;
      });
      return [...diplomaQualificationsToAdd, ...diplomaQualificationCollection];
    }
    return diplomaQualificationCollection;
  }

  protected convertDateFromClient<T extends IDiplomaQualification | NewDiplomaQualification | PartialUpdateDiplomaQualification>(
    diplomaQualification: T,
  ): RestOf<T> {
    return {
      ...diplomaQualification,
      effectiveDate: diplomaQualification.effectiveDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restDiplomaQualification: RestDiplomaQualification): IDiplomaQualification {
    return {
      ...restDiplomaQualification,
      effectiveDate: restDiplomaQualification.effectiveDate ? dayjs(restDiplomaQualification.effectiveDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDiplomaQualification>): HttpResponse<IDiplomaQualification> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDiplomaQualification[]>): HttpResponse<IDiplomaQualification[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
