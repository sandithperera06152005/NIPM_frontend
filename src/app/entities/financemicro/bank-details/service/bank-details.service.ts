import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, map, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { IBankDetails, NewBankDetails } from '../bank-details.model';

export type PartialUpdateBankDetails = Partial<IBankDetails> & Pick<IBankDetails, 'id'>;

type RestOf<T extends IBankDetails | NewBankDetails> = Omit<T, 'lmd'> & {
  lmd?: string | null;
};

export type RestBankDetails = RestOf<IBankDetails>;

export type NewRestBankDetails = RestOf<NewBankDetails>;

export type PartialUpdateRestBankDetails = RestOf<PartialUpdateBankDetails>;

export type EntityResponseType = HttpResponse<IBankDetails>;
export type EntityArrayResponseType = HttpResponse<IBankDetails[]>;

@Injectable({ providedIn: 'root' })
export class BankDetailsService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bank-details', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/bank-details/_search', 'financemicro');

  create(bankDetails: NewBankDetails): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bankDetails);
    return this.http
      .post<RestBankDetails>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(bankDetails: IBankDetails): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bankDetails);
    return this.http
      .put<RestBankDetails>(`${this.resourceUrl}/${this.getBankDetailsIdentifier(bankDetails)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(bankDetails: PartialUpdateBankDetails): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bankDetails);
    return this.http
      .patch<RestBankDetails>(`${this.resourceUrl}/${this.getBankDetailsIdentifier(bankDetails)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestBankDetails>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBankDetails[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestBankDetails[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),

      catchError(() => scheduled([new HttpResponse<IBankDetails[]>()], asapScheduler)),
    );
  }

  getBankDetailsIdentifier(bankDetails: Pick<IBankDetails, 'id'>): number {
    return bankDetails.id;
  }

  compareBankDetails(o1: Pick<IBankDetails, 'id'> | null, o2: Pick<IBankDetails, 'id'> | null): boolean {
    return o1 && o2 ? this.getBankDetailsIdentifier(o1) === this.getBankDetailsIdentifier(o2) : o1 === o2;
  }

  addBankDetailsToCollectionIfMissing<Type extends Pick<IBankDetails, 'id'>>(
    bankDetailsCollection: Type[],
    ...bankDetailsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bankDetails: Type[] = bankDetailsToCheck.filter(isPresent);
    if (bankDetails.length > 0) {
      const bankDetailsCollectionIdentifiers = bankDetailsCollection.map(bankDetailsItem => this.getBankDetailsIdentifier(bankDetailsItem));
      const bankDetailsToAdd = bankDetails.filter(bankDetailsItem => {
        const bankDetailsIdentifier = this.getBankDetailsIdentifier(bankDetailsItem);
        if (bankDetailsCollectionIdentifiers.includes(bankDetailsIdentifier)) {
          return false;
        }
        bankDetailsCollectionIdentifiers.push(bankDetailsIdentifier);
        return true;
      });
      return [...bankDetailsToAdd, ...bankDetailsCollection];
    }
    return bankDetailsCollection;
  }

  protected convertDateFromClient<T extends IBankDetails | NewBankDetails | PartialUpdateBankDetails>(bankDetails: T): RestOf<T> {
    return {
      ...bankDetails,
      lmd: bankDetails.lmd?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restBankDetails: RestBankDetails): IBankDetails {
    return {
      ...restBankDetails,
      lmd: restBankDetails.lmd ? dayjs(restBankDetails.lmd) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestBankDetails>): HttpResponse<IBankDetails> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestBankDetails[]>): HttpResponse<IBankDetails[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
