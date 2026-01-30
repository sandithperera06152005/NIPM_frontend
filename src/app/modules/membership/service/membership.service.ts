// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IMembership, NewMembership } from '../membership.model';



export type PartialUpdateMembership = Partial<IMembership> & Pick<IMembership, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IMembership | NewMembership | PartialUpdateMembership> = Omit<T, 'startDate' | 'endDate'> & {
  
  startDate?: string | null;
  
  endDate?: string | null;
  
};

export type RestMembership = RestOf<IMembership>;
export type NewRestMembership = RestOf<NewMembership>;
export type PartialUpdateRestMembership = RestOf<PartialUpdateMembership>;

export type EntityResponseType = HttpResponse<IMembership>;
export type EntityArrayResponseType = HttpResponse<IMembership[]>;


@Injectable({ providedIn: 'root' })
export class MembershipService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/memberships';

  create(payload: NewMembership): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestMembership>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IMembership): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestMembership>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestMembership>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestMembership[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IMembership | NewMembership | PartialUpdateMembership>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.startDate)) {
      copy.startDate = entity.startDate.toJSON();
    }
    
    if (dayjs.isDayjs(entity.endDate)) {
      copy.endDate = entity.endDate.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestMembership): IMembership {
    const entity: any = { ...restEntity };
    
    if (entity.startDate) {
        entity.startDate = dayjs(entity.startDate);
    }
    
    if (entity.endDate) {
        entity.endDate = dayjs(entity.endDate);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestMembership>): HttpResponse<IMembership> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMembership[]>): HttpResponse<IMembership[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
