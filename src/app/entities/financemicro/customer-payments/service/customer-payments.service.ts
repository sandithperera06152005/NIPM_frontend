import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, map, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { ICustomerPayments, NewCustomerPayments } from '../customer-payments.model';

export type PartialUpdateCustomerPayments = Partial<ICustomerPayments> & Pick<ICustomerPayments, 'id'>;

type RestOf<T extends ICustomerPayments | NewCustomerPayments> = Omit<T, 'date' | 'lmd'> & {
  date?: string | null;
  lmd?: string | null;
};

export type RestCustomerPayments = RestOf<ICustomerPayments>;

export type NewRestCustomerPayments = RestOf<NewCustomerPayments>;

export type PartialUpdateRestCustomerPayments = RestOf<PartialUpdateCustomerPayments>;

export type EntityResponseType = HttpResponse<ICustomerPayments>;
export type EntityArrayResponseType = HttpResponse<ICustomerPayments[]>;

@Injectable({ providedIn: 'root' })
export class CustomerPaymentsService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/customer-payments', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/customer-payments/_search', 'financemicro');

  create(customerPayments: NewCustomerPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(customerPayments);
    return this.http
      .post<RestCustomerPayments>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(customerPayments: ICustomerPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(customerPayments);
    return this.http
      .put<RestCustomerPayments>(`${this.resourceUrl}/${this.getCustomerPaymentsIdentifier(customerPayments)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(customerPayments: PartialUpdateCustomerPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(customerPayments);
    return this.http
      .patch<RestCustomerPayments>(`${this.resourceUrl}/${this.getCustomerPaymentsIdentifier(customerPayments)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCustomerPayments>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCustomerPayments[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestCustomerPayments[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<ICustomerPayments[]>()], asapScheduler)),
    );
  }

  getCustomerPaymentsIdentifier(customerPayments: Pick<ICustomerPayments, 'id'>): number {
    return customerPayments.id;
  }

  compareCustomerPayments(o1: Pick<ICustomerPayments, 'id'> | null, o2: Pick<ICustomerPayments, 'id'> | null): boolean {
    return o1 && o2 ? this.getCustomerPaymentsIdentifier(o1) === this.getCustomerPaymentsIdentifier(o2) : o1 === o2;
  }

  addCustomerPaymentsToCollectionIfMissing<Type extends Pick<ICustomerPayments, 'id'>>(
    customerPaymentsCollection: Type[],
    ...customerPaymentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const customerPayments: Type[] = customerPaymentsToCheck.filter(isPresent);
    if (customerPayments.length > 0) {
      const customerPaymentsCollectionIdentifiers = customerPaymentsCollection.map(customerPaymentsItem =>
        this.getCustomerPaymentsIdentifier(customerPaymentsItem),
      );
      const customerPaymentsToAdd = customerPayments.filter(customerPaymentsItem => {
        const customerPaymentsIdentifier = this.getCustomerPaymentsIdentifier(customerPaymentsItem);
        if (customerPaymentsCollectionIdentifiers.includes(customerPaymentsIdentifier)) {
          return false;
        }
        customerPaymentsCollectionIdentifiers.push(customerPaymentsIdentifier);
        return true;
      });
      return [...customerPaymentsToAdd, ...customerPaymentsCollection];
    }
    return customerPaymentsCollection;
  }

  protected convertDateFromClient<T extends ICustomerPayments | NewCustomerPayments | PartialUpdateCustomerPayments>(
    customerPayments: T,
  ): RestOf<T> {
    return {
      ...customerPayments,
      date: customerPayments.date?.toJSON() ?? null,
      lmd: customerPayments.lmd?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restCustomerPayments: RestCustomerPayments): ICustomerPayments {
    return {
      ...restCustomerPayments,
      date: restCustomerPayments.date ? dayjs(restCustomerPayments.date) : undefined,
      lmd: restCustomerPayments.lmd ? dayjs(restCustomerPayments.lmd) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestCustomerPayments>): HttpResponse<ICustomerPayments> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCustomerPayments[]>): HttpResponse<ICustomerPayments[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
