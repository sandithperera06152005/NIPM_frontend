// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICompany, NewCompany } from '../company.model';



export type PartialUpdateCompany = Partial<ICompany> & Pick<ICompany, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends ICompany | NewCompany | PartialUpdateCompany> = Omit<T, 'createdAt'> & {
  
  createdAt?: string | null;
  
};

export type RestCompany = RestOf<ICompany>;
export type NewRestCompany = RestOf<NewCompany>;
export type PartialUpdateRestCompany = RestOf<PartialUpdateCompany>;

export type EntityResponseType = HttpResponse<ICompany>;
export type EntityArrayResponseType = HttpResponse<ICompany[]>;


@Injectable({ providedIn: 'root' })
export class CompanyService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/companies';

  create(payload: NewCompany): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCompany>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICompany): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCompany>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCompany>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCompany[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICompany | NewCompany | PartialUpdateCompany>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.createdAt)) {
      copy.createdAt = entity.createdAt.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCompany): ICompany {
    const entity: any = { ...restEntity };
    
    if (entity.createdAt) {
        entity.createdAt = dayjs(entity.createdAt);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCompany>): HttpResponse<ICompany> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCompany[]>): HttpResponse<ICompany[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
