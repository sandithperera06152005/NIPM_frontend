import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IAdvancedLevelSubject, NewAdvancedLevelSubject } from '../advanced-level-subject.model';

export type PartialUpdateAdvancedLevelSubject = Partial<IAdvancedLevelSubject> & Pick<IAdvancedLevelSubject, 'id'>;

export type EntityResponseType = HttpResponse<IAdvancedLevelSubject>;
export type EntityArrayResponseType = HttpResponse<IAdvancedLevelSubject[]>;

@Injectable({ providedIn: 'root' })
export class AdvancedLevelSubjectService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/advanced-level-subjects');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/advanced-level-subjects/_search');

  create(advancedLevelSubject: NewAdvancedLevelSubject): Observable<EntityResponseType> {
    return this.http.post<IAdvancedLevelSubject>(this.resourceUrl, advancedLevelSubject, { observe: 'response' });
  }

  update(advancedLevelSubject: IAdvancedLevelSubject): Observable<EntityResponseType> {
    return this.http.put<IAdvancedLevelSubject>(
      `${this.resourceUrl}/${this.getAdvancedLevelSubjectIdentifier(advancedLevelSubject)}`,
      advancedLevelSubject,
      { observe: 'response' },
    );
  }

  partialUpdate(advancedLevelSubject: PartialUpdateAdvancedLevelSubject): Observable<EntityResponseType> {
    return this.http.patch<IAdvancedLevelSubject>(
      `${this.resourceUrl}/${this.getAdvancedLevelSubjectIdentifier(advancedLevelSubject)}`,
      advancedLevelSubject,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAdvancedLevelSubject>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAdvancedLevelSubject[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAdvancedLevelSubject[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAdvancedLevelSubject[]>()], asapScheduler)));
  }

  getAdvancedLevelSubjectIdentifier(advancedLevelSubject: Pick<IAdvancedLevelSubject, 'id'>): number {
    return advancedLevelSubject.id;
  }

  compareAdvancedLevelSubject(o1: Pick<IAdvancedLevelSubject, 'id'> | null, o2: Pick<IAdvancedLevelSubject, 'id'> | null): boolean {
    return o1 && o2 ? this.getAdvancedLevelSubjectIdentifier(o1) === this.getAdvancedLevelSubjectIdentifier(o2) : o1 === o2;
  }

  addAdvancedLevelSubjectToCollectionIfMissing<Type extends Pick<IAdvancedLevelSubject, 'id'>>(
    advancedLevelSubjectCollection: Type[],
    ...advancedLevelSubjectsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const advancedLevelSubjects: Type[] = advancedLevelSubjectsToCheck.filter(isPresent);
    if (advancedLevelSubjects.length > 0) {
      const advancedLevelSubjectCollectionIdentifiers = advancedLevelSubjectCollection.map(advancedLevelSubjectItem =>
        this.getAdvancedLevelSubjectIdentifier(advancedLevelSubjectItem),
      );
      const advancedLevelSubjectsToAdd = advancedLevelSubjects.filter(advancedLevelSubjectItem => {
        const advancedLevelSubjectIdentifier = this.getAdvancedLevelSubjectIdentifier(advancedLevelSubjectItem);
        if (advancedLevelSubjectCollectionIdentifiers.includes(advancedLevelSubjectIdentifier)) {
          return false;
        }
        advancedLevelSubjectCollectionIdentifiers.push(advancedLevelSubjectIdentifier);
        return true;
      });
      return [...advancedLevelSubjectsToAdd, ...advancedLevelSubjectCollection];
    }
    return advancedLevelSubjectCollection;
  }
}
