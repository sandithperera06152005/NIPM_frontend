import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IAdvancedLevelQualification, NewAdvancedLevelQualification } from '../advanced-level-qualification.model';

export type PartialUpdateAdvancedLevelQualification = Partial<IAdvancedLevelQualification> & Pick<IAdvancedLevelQualification, 'id'>;

export type EntityResponseType = HttpResponse<IAdvancedLevelQualification>;
export type EntityArrayResponseType = HttpResponse<IAdvancedLevelQualification[]>;

@Injectable({ providedIn: 'root' })
export class AdvancedLevelQualificationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/advanced-level-qualifications');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/advanced-level-qualifications/_search');

  create(advancedLevelQualification: NewAdvancedLevelQualification): Observable<EntityResponseType> {
    return this.http.post<IAdvancedLevelQualification>(this.resourceUrl, advancedLevelQualification, { observe: 'response' });
  }

  update(advancedLevelQualification: IAdvancedLevelQualification): Observable<EntityResponseType> {
    return this.http.put<IAdvancedLevelQualification>(
      `${this.resourceUrl}/${this.getAdvancedLevelQualificationIdentifier(advancedLevelQualification)}`,
      advancedLevelQualification,
      { observe: 'response' },
    );
  }

  partialUpdate(advancedLevelQualification: PartialUpdateAdvancedLevelQualification): Observable<EntityResponseType> {
    return this.http.patch<IAdvancedLevelQualification>(
      `${this.resourceUrl}/${this.getAdvancedLevelQualificationIdentifier(advancedLevelQualification)}`,
      advancedLevelQualification,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAdvancedLevelQualification>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAdvancedLevelQualification[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAdvancedLevelQualification[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAdvancedLevelQualification[]>()], asapScheduler)));
  }

  getAdvancedLevelQualificationIdentifier(advancedLevelQualification: Pick<IAdvancedLevelQualification, 'id'>): number {
    return advancedLevelQualification.id;
  }

  compareAdvancedLevelQualification(
    o1: Pick<IAdvancedLevelQualification, 'id'> | null,
    o2: Pick<IAdvancedLevelQualification, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getAdvancedLevelQualificationIdentifier(o1) === this.getAdvancedLevelQualificationIdentifier(o2) : o1 === o2;
  }

  addAdvancedLevelQualificationToCollectionIfMissing<Type extends Pick<IAdvancedLevelQualification, 'id'>>(
    advancedLevelQualificationCollection: Type[],
    ...advancedLevelQualificationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const advancedLevelQualifications: Type[] = advancedLevelQualificationsToCheck.filter(isPresent);
    if (advancedLevelQualifications.length > 0) {
      const advancedLevelQualificationCollectionIdentifiers = advancedLevelQualificationCollection.map(advancedLevelQualificationItem =>
        this.getAdvancedLevelQualificationIdentifier(advancedLevelQualificationItem),
      );
      const advancedLevelQualificationsToAdd = advancedLevelQualifications.filter(advancedLevelQualificationItem => {
        const advancedLevelQualificationIdentifier = this.getAdvancedLevelQualificationIdentifier(advancedLevelQualificationItem);
        if (advancedLevelQualificationCollectionIdentifiers.includes(advancedLevelQualificationIdentifier)) {
          return false;
        }
        advancedLevelQualificationCollectionIdentifiers.push(advancedLevelQualificationIdentifier);
        return true;
      });
      return [...advancedLevelQualificationsToAdd, ...advancedLevelQualificationCollection];
    }
    return advancedLevelQualificationCollection;
  }
}
