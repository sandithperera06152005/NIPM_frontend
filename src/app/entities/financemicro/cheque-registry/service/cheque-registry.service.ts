import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IChequeRegistry, NewChequeRegistry } from '../cheque-registry.model';

export type PartialUpdateChequeRegistry = Partial<IChequeRegistry> & Pick<IChequeRegistry, 'id'>;

type RestOf<T extends IChequeRegistry | NewChequeRegistry> = Omit<T, 'chequeDate' | 'depositedDate' | 'lmd'> & {
  chequeDate?: string | null;
  depositedDate?: string | null;
  lmd?: string | null;
};

export type RestChequeRegistry = RestOf<IChequeRegistry>;

export type NewRestChequeRegistry = RestOf<NewChequeRegistry>;

export type PartialUpdateRestChequeRegistry = RestOf<PartialUpdateChequeRegistry>;

export type EntityResponseType = HttpResponse<IChequeRegistry>;
export type EntityArrayResponseType = HttpResponse<IChequeRegistry[]>;

@Injectable({ providedIn: 'root' })
export class ChequeRegistryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/cheque-registries', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/cheque-registries/_search', 'financemicro');
  
  create(chequeRegistry: NewChequeRegistry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chequeRegistry);
    return this.http
      .post<RestChequeRegistry>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(chequeRegistry: IChequeRegistry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chequeRegistry);
    return this.http
      .put<RestChequeRegistry>(`${this.resourceUrl}/${this.getChequeRegistryIdentifier(chequeRegistry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(chequeRegistry: PartialUpdateChequeRegistry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chequeRegistry);
    return this.http
      .patch<RestChequeRegistry>(`${this.resourceUrl}/${this.getChequeRegistryIdentifier(chequeRegistry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestChequeRegistry>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChequeRegistry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getChequeRegistryIdentifier(chequeRegistry: Pick<IChequeRegistry, 'id'>): number {
    return chequeRegistry.id;
  }

  compareChequeRegistry(o1: Pick<IChequeRegistry, 'id'> | null, o2: Pick<IChequeRegistry, 'id'> | null): boolean {
    return o1 && o2 ? this.getChequeRegistryIdentifier(o1) === this.getChequeRegistryIdentifier(o2) : o1 === o2;
  }

  addChequeRegistryToCollectionIfMissing<Type extends Pick<IChequeRegistry, 'id'>>(
    chequeRegistryCollection: Type[],
    ...chequeRegistriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const chequeRegistries: Type[] = chequeRegistriesToCheck.filter(isPresent);
    if (chequeRegistries.length > 0) {
      const chequeRegistryCollectionIdentifiers = chequeRegistryCollection.map(chequeRegistryItem =>
        this.getChequeRegistryIdentifier(chequeRegistryItem),
      );
      const chequeRegistriesToAdd = chequeRegistries.filter(chequeRegistryItem => {
        const chequeRegistryIdentifier = this.getChequeRegistryIdentifier(chequeRegistryItem);
        if (chequeRegistryCollectionIdentifiers.includes(chequeRegistryIdentifier)) {
          return false;
        }
        chequeRegistryCollectionIdentifiers.push(chequeRegistryIdentifier);
        return true;
      });
      return [...chequeRegistriesToAdd, ...chequeRegistryCollection];
    }
    return chequeRegistryCollection;
  }

  protected convertDateFromClient<T extends IChequeRegistry | NewChequeRegistry | PartialUpdateChequeRegistry>(
    chequeRegistry: T,
  ): RestOf<T> {
    return {
      ...chequeRegistry,
      chequeDate: chequeRegistry.chequeDate?.toJSON() ?? null,
      depositedDate: chequeRegistry.depositedDate?.toJSON() ?? null,
      lmd: chequeRegistry.lmd?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restChequeRegistry: RestChequeRegistry): IChequeRegistry {
    return {
      ...restChequeRegistry,
      chequeDate: restChequeRegistry.chequeDate ? dayjs(restChequeRegistry.chequeDate) : undefined,
      depositedDate: restChequeRegistry.depositedDate ? dayjs(restChequeRegistry.depositedDate) : undefined,
      lmd: restChequeRegistry.lmd ? dayjs(restChequeRegistry.lmd) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestChequeRegistry>): HttpResponse<IChequeRegistry> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestChequeRegistry[]>): HttpResponse<IChequeRegistry[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
