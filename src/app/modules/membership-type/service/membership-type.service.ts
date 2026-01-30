// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IMembershipType, NewMembershipType } from '../membership-type.model';



export type PartialUpdateMembershipType = Partial<IMembershipType> & Pick<IMembershipType, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IMembershipType | NewMembershipType | PartialUpdateMembershipType> = Omit<T, 'startDate' | 'endDate'> & {
  
};

export type RestMembershipType = RestOf<IMembershipType>;
export type NewRestMembershipType = RestOf<NewMembershipType>;
export type PartialUpdateRestMembershipType = RestOf<PartialUpdateMembershipType>;

export type EntityResponseType = HttpResponse<IMembershipType>;
export type EntityArrayResponseType = HttpResponse<IMembershipType[]>;


@Injectable({ providedIn: 'root' })
export class MembershipTypeService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/membership-types';

  create(payload: NewMembershipType): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestMembershipType>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IMembershipType): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestMembershipType>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestMembershipType>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestMembershipType[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IMembershipType | NewMembershipType | PartialUpdateMembershipType>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestMembershipType): IMembershipType {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestMembershipType>): HttpResponse<IMembershipType> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMembershipType[]>): HttpResponse<IMembershipType[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
