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
import { IIndustryExperience, NewIndustryExperience } from '../industry-experience.model';

export type PartialUpdateIndustryExperience = Partial<IIndustryExperience> & Pick<IIndustryExperience, 'id'>;

type RestOf<T extends IIndustryExperience | NewIndustryExperience> = Omit<T, 'fromDate' | 'toDate'> & {
  fromDate?: string | null;
  toDate?: string | null;
};

export type RestIndustryExperience = RestOf<IIndustryExperience>;

export type NewRestIndustryExperience = RestOf<NewIndustryExperience>;

export type PartialUpdateRestIndustryExperience = RestOf<PartialUpdateIndustryExperience>;

export type EntityResponseType = HttpResponse<IIndustryExperience>;
export type EntityArrayResponseType = HttpResponse<IIndustryExperience[]>;

@Injectable({ providedIn: 'root' })
export class IndustryExperienceService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/industry-experiences');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/industry-experiences/_search');

  create(industryExperience: NewIndustryExperience): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(industryExperience);
    return this.http
      .post<RestIndustryExperience>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(industryExperience: IIndustryExperience): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(industryExperience);
    return this.http
      .put<RestIndustryExperience>(`${this.resourceUrl}/${this.getIndustryExperienceIdentifier(industryExperience)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(industryExperience: PartialUpdateIndustryExperience): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(industryExperience);
    return this.http
      .patch<RestIndustryExperience>(`${this.resourceUrl}/${this.getIndustryExperienceIdentifier(industryExperience)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestIndustryExperience>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestIndustryExperience[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestIndustryExperience[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IIndustryExperience[]>()], asapScheduler)),
    );
  }

  getIndustryExperienceIdentifier(industryExperience: Pick<IIndustryExperience, 'id'>): number {
    return industryExperience.id;
  }

  compareIndustryExperience(o1: Pick<IIndustryExperience, 'id'> | null, o2: Pick<IIndustryExperience, 'id'> | null): boolean {
    return o1 && o2 ? this.getIndustryExperienceIdentifier(o1) === this.getIndustryExperienceIdentifier(o2) : o1 === o2;
  }

  addIndustryExperienceToCollectionIfMissing<Type extends Pick<IIndustryExperience, 'id'>>(
    industryExperienceCollection: Type[],
    ...industryExperiencesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const industryExperiences: Type[] = industryExperiencesToCheck.filter(isPresent);
    if (industryExperiences.length > 0) {
      const industryExperienceCollectionIdentifiers = industryExperienceCollection.map(industryExperienceItem =>
        this.getIndustryExperienceIdentifier(industryExperienceItem),
      );
      const industryExperiencesToAdd = industryExperiences.filter(industryExperienceItem => {
        const industryExperienceIdentifier = this.getIndustryExperienceIdentifier(industryExperienceItem);
        if (industryExperienceCollectionIdentifiers.includes(industryExperienceIdentifier)) {
          return false;
        }
        industryExperienceCollectionIdentifiers.push(industryExperienceIdentifier);
        return true;
      });
      return [...industryExperiencesToAdd, ...industryExperienceCollection];
    }
    return industryExperienceCollection;
  }

  protected convertDateFromClient<T extends IIndustryExperience | NewIndustryExperience | PartialUpdateIndustryExperience>(
    industryExperience: T,
  ): RestOf<T> {
    return {
      ...industryExperience,
      fromDate: industryExperience.fromDate?.format(DATE_FORMAT) ?? null,
      toDate: industryExperience.toDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restIndustryExperience: RestIndustryExperience): IIndustryExperience {
    return {
      ...restIndustryExperience,
      fromDate: restIndustryExperience.fromDate ? dayjs(restIndustryExperience.fromDate) : undefined,
      toDate: restIndustryExperience.toDate ? dayjs(restIndustryExperience.toDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestIndustryExperience>): HttpResponse<IIndustryExperience> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestIndustryExperience[]>): HttpResponse<IIndustryExperience[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
