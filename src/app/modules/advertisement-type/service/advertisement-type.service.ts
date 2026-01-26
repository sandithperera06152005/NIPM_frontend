// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IAdvertisementType, NewAdvertisementType } from '../advertisement-type.model';



export type PartialUpdateAdvertisementType = Partial<IAdvertisementType> & Pick<IAdvertisementType, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IAdvertisementType | NewAdvertisementType | PartialUpdateAdvertisementType> = T;

export type RestAdvertisementType = RestOf<IAdvertisementType>;
export type NewRestAdvertisementType = RestOf<NewAdvertisementType>;
export type PartialUpdateRestAdvertisementType = RestOf<PartialUpdateAdvertisementType>;

export type EntityResponseType = HttpResponse<IAdvertisementType>;
export type EntityArrayResponseType = HttpResponse<IAdvertisementType[]>;


@Injectable({ providedIn: 'root' })
export class AdvertisementTypeService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/advertisement-types';

  create(payload: NewAdvertisementType): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestAdvertisementType>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IAdvertisementType): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestAdvertisementType>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestAdvertisementType>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestAdvertisementType[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  protected createRequestOption(req?: any): HttpParams {
    let options: HttpParams = new HttpParams();
    if (req) {
      Object.keys(req).forEach(key => {
        if (req[key] !== null && req[key] !== undefined) {
          options = options.set(key, req[key]);
        }
      });
    }
    return options;
  };

  // --- Date Conversion Helpers ---
  protected convertDateFromClient<T extends IAdvertisementType | NewAdvertisementType | PartialUpdateAdvertisementType>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestAdvertisementType): IAdvertisementType {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestAdvertisementType>): HttpResponse<IAdvertisementType> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAdvertisementType[]>): HttpResponse<IAdvertisementType[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
