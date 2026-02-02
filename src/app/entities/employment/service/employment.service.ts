import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IEmployment, NewEmployment } from '../employment.model';

export type PartialUpdateEmployment = Partial<IEmployment> & Pick<IEmployment, 'id'>;

export type EntityResponseType = HttpResponse<IEmployment>;
export type EntityArrayResponseType = HttpResponse<IEmployment[]>;

@Injectable({ providedIn: 'root' })
export class EmploymentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/employments');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/employments/_search');

  create(employment: NewEmployment): Observable<EntityResponseType> {
    return this.http.post<IEmployment>(this.resourceUrl, employment, { observe: 'response' });
  }

  update(employment: IEmployment): Observable<EntityResponseType> {
    return this.http.put<IEmployment>(`${this.resourceUrl}/${this.getEmploymentIdentifier(employment)}`, employment, {
      observe: 'response',
    });
  }

  partialUpdate(employment: PartialUpdateEmployment): Observable<EntityResponseType> {
    return this.http.patch<IEmployment>(`${this.resourceUrl}/${this.getEmploymentIdentifier(employment)}`, employment, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IEmployment>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IEmployment[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IEmployment[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IEmployment[]>()], asapScheduler)));
  }

  getEmploymentIdentifier(employment: Pick<IEmployment, 'id'>): number {
    return employment.id;
  }

  compareEmployment(o1: Pick<IEmployment, 'id'> | null, o2: Pick<IEmployment, 'id'> | null): boolean {
    return o1 && o2 ? this.getEmploymentIdentifier(o1) === this.getEmploymentIdentifier(o2) : o1 === o2;
  }

  addEmploymentToCollectionIfMissing<Type extends Pick<IEmployment, 'id'>>(
    employmentCollection: Type[],
    ...employmentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const employments: Type[] = employmentsToCheck.filter(isPresent);
    if (employments.length > 0) {
      const employmentCollectionIdentifiers = employmentCollection.map(employmentItem => this.getEmploymentIdentifier(employmentItem));
      const employmentsToAdd = employments.filter(employmentItem => {
        const employmentIdentifier = this.getEmploymentIdentifier(employmentItem);
        if (employmentCollectionIdentifiers.includes(employmentIdentifier)) {
          return false;
        }
        employmentCollectionIdentifiers.push(employmentIdentifier);
        return true;
      });
      return [...employmentsToAdd, ...employmentCollection];
    }
    return employmentCollection;
  }
}
