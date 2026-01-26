import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IJournalVoucher, NewJournalVoucher } from '../journal-voucher.model';

export type PartialUpdateJournalVoucher = Partial<IJournalVoucher> & Pick<IJournalVoucher, 'id'>;

type RestOf<T extends IJournalVoucher | NewJournalVoucher> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestJournalVoucher = RestOf<IJournalVoucher>;

export type NewRestJournalVoucher = RestOf<NewJournalVoucher>;

export type PartialUpdateRestJournalVoucher = RestOf<PartialUpdateJournalVoucher>;

export type EntityResponseType = HttpResponse<IJournalVoucher>;
export type EntityArrayResponseType = HttpResponse<IJournalVoucher[]>;

@Injectable({ providedIn: 'root' })
export class JournalVoucherService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/journal-vouchers', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/journal-vouchers/_search', 'financemicro');

  create(journalVoucher: NewJournalVoucher): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(journalVoucher);
    return this.http
      .post<RestJournalVoucher>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(journalVoucher: IJournalVoucher): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(journalVoucher);
    return this.http
      .put<RestJournalVoucher>(`${this.resourceUrl}/${this.getJournalVoucherIdentifier(journalVoucher)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(journalVoucher: PartialUpdateJournalVoucher): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(journalVoucher);
    return this.http
      .patch<RestJournalVoucher>(`${this.resourceUrl}/${this.getJournalVoucherIdentifier(journalVoucher)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestJournalVoucher>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestJournalVoucher[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getJournalVoucherIdentifier(journalVoucher: Pick<IJournalVoucher, 'id'>): number {
    return journalVoucher.id;
  }

  compareJournalVoucher(o1: Pick<IJournalVoucher, 'id'> | null, o2: Pick<IJournalVoucher, 'id'> | null): boolean {
    return o1 && o2 ? this.getJournalVoucherIdentifier(o1) === this.getJournalVoucherIdentifier(o2) : o1 === o2;
  }

  addJournalVoucherToCollectionIfMissing<Type extends Pick<IJournalVoucher, 'id'>>(
    journalVoucherCollection: Type[],
    ...journalVouchersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const journalVouchers: Type[] = journalVouchersToCheck.filter(isPresent);
    if (journalVouchers.length > 0) {
      const journalVoucherCollectionIdentifiers = journalVoucherCollection.map(journalVoucherItem =>
        this.getJournalVoucherIdentifier(journalVoucherItem),
      );
      const journalVouchersToAdd = journalVouchers.filter(journalVoucherItem => {
        const journalVoucherIdentifier = this.getJournalVoucherIdentifier(journalVoucherItem);
        if (journalVoucherCollectionIdentifiers.includes(journalVoucherIdentifier)) {
          return false;
        }
        journalVoucherCollectionIdentifiers.push(journalVoucherIdentifier);
        return true;
      });
      return [...journalVouchersToAdd, ...journalVoucherCollection];
    }
    return journalVoucherCollection;
  }

  protected convertDateFromClient<T extends IJournalVoucher | NewJournalVoucher | PartialUpdateJournalVoucher>(
    journalVoucher: T,
  ): RestOf<T> {
    return {
      ...journalVoucher,
      date: journalVoucher.date?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restJournalVoucher: RestJournalVoucher): IJournalVoucher {
    return {
      ...restJournalVoucher,
      date: restJournalVoucher.date ? dayjs(restJournalVoucher.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestJournalVoucher>): HttpResponse<IJournalVoucher> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestJournalVoucher[]>): HttpResponse<IJournalVoucher[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
