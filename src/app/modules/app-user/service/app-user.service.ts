// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IAppUser, NewAppUser } from '../app-user.model';



export type PartialUpdateAppUser = Partial<IAppUser> & Pick<IAppUser, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IAppUser | NewAppUser | PartialUpdateAppUser> = Omit<T, 'createdAt' | 'updatedAt' | 'lastLoginAt'> & {
  
  createdAt?: string | null;
  
  updatedAt?: string | null;
  
  lastLoginAt?: string | null;
  
};

export type RestAppUser = RestOf<IAppUser>;
export type NewRestAppUser = RestOf<NewAppUser>;
export type PartialUpdateRestAppUser = RestOf<PartialUpdateAppUser>;

export type EntityResponseType = HttpResponse<IAppUser>;
export type EntityArrayResponseType = HttpResponse<IAppUser[]>;


@Injectable({ providedIn: 'root' })
export class AppUserService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/app-users';

  create(payload: NewAppUser): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestAppUser>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IAppUser): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestAppUser>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestAppUser>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestAppUser[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IAppUser | NewAppUser | PartialUpdateAppUser>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.createdAt)) {
      copy.createdAt = entity.createdAt.toJSON();
    }
    
    if (dayjs.isDayjs(entity.updatedAt)) {
      copy.updatedAt = entity.updatedAt.toJSON();
    }
    
    if (dayjs.isDayjs(entity.lastLoginAt)) {
      copy.lastLoginAt = entity.lastLoginAt.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestAppUser): IAppUser {
    const entity: any = { ...restEntity };
    
    if (entity.createdAt) {
        entity.createdAt = dayjs(entity.createdAt);
    }
    
    if (entity.updatedAt) {
        entity.updatedAt = dayjs(entity.updatedAt);
    }
    
    if (entity.lastLoginAt) {
        entity.lastLoginAt = dayjs(entity.lastLoginAt);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestAppUser>): HttpResponse<IAppUser> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAppUser[]>): HttpResponse<IAppUser[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
