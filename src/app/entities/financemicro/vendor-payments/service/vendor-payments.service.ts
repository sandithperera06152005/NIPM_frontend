import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IVendorPayments, NewVendorPayments } from '../vendor-payments.model';

export type PartialUpdateVendorPayments = Partial<IVendorPayments> & Pick<IVendorPayments, 'id'>;

type RestOf<T extends IVendorPayments | NewVendorPayments> = Omit<T, 'date' | 'lmd'> & {
  date?: string | null;
  lmd?: string | null;
};

export type RestVendorPayments = RestOf<IVendorPayments>;

export type NewRestVendorPayments = RestOf<NewVendorPayments>;

export type PartialUpdateRestVendorPayments = RestOf<PartialUpdateVendorPayments>;

export type EntityResponseType = HttpResponse<IVendorPayments>;
export type EntityArrayResponseType = HttpResponse<IVendorPayments[]>;

@Injectable({ providedIn: 'root' })
export class VendorPaymentsService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/vendor-payments', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/vendor-payments/_search', 'financemicro');

  create(vendorPayments: NewVendorPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vendorPayments);
    return this.http
      .post<RestVendorPayments>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(vendorPayments: IVendorPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vendorPayments);
    return this.http
      .put<RestVendorPayments>(`${this.resourceUrl}/${this.getVendorPaymentsIdentifier(vendorPayments)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(vendorPayments: PartialUpdateVendorPayments): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vendorPayments);
    return this.http
      .patch<RestVendorPayments>(`${this.resourceUrl}/${this.getVendorPaymentsIdentifier(vendorPayments)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestVendorPayments>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestVendorPayments[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getVendorPaymentsIdentifier(vendorPayments: Pick<IVendorPayments, 'id'>): number {
    return vendorPayments.id;
  }

  compareVendorPayments(o1: Pick<IVendorPayments, 'id'> | null, o2: Pick<IVendorPayments, 'id'> | null): boolean {
    return o1 && o2 ? this.getVendorPaymentsIdentifier(o1) === this.getVendorPaymentsIdentifier(o2) : o1 === o2;
  }

  addVendorPaymentsToCollectionIfMissing<Type extends Pick<IVendorPayments, 'id'>>(
    vendorPaymentsCollection: Type[],
    ...vendorPaymentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const vendorPayments: Type[] = vendorPaymentsToCheck.filter(isPresent);
    if (vendorPayments.length > 0) {
      const vendorPaymentsCollectionIdentifiers = vendorPaymentsCollection.map(vendorPaymentsItem =>
        this.getVendorPaymentsIdentifier(vendorPaymentsItem),
      );
      const vendorPaymentsToAdd = vendorPayments.filter(vendorPaymentsItem => {
        const vendorPaymentsIdentifier = this.getVendorPaymentsIdentifier(vendorPaymentsItem);
        if (vendorPaymentsCollectionIdentifiers.includes(vendorPaymentsIdentifier)) {
          return false;
        }
        vendorPaymentsCollectionIdentifiers.push(vendorPaymentsIdentifier);
        return true;
      });
      return [...vendorPaymentsToAdd, ...vendorPaymentsCollection];
    }
    return vendorPaymentsCollection;
  }

  protected convertDateFromClient<T extends IVendorPayments | NewVendorPayments | PartialUpdateVendorPayments>(
    vendorPayments: T,
  ): RestOf<T> {
    return {
      ...vendorPayments,
      date: vendorPayments.date?.toJSON() ?? null,
      lmd: vendorPayments.lmd?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restVendorPayments: RestVendorPayments): IVendorPayments {
    return {
      ...restVendorPayments,
      date: restVendorPayments.date ? dayjs(restVendorPayments.date) : undefined,
      lmd: restVendorPayments.lmd ? dayjs(restVendorPayments.lmd) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestVendorPayments>): HttpResponse<IVendorPayments> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestVendorPayments[]>): HttpResponse<IVendorPayments[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
