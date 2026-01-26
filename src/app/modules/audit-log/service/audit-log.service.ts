// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IAuditLog, NewAuditLog } from '../audit-log.model';



export type PartialUpdateAuditLog = Partial<IAuditLog> & Pick<IAuditLog, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IAuditLog | NewAuditLog | PartialUpdateAuditLog> = Omit<T, 'performedAt'> & {
  
  performedAt?: string | null;
  
};

export type RestAuditLog = RestOf<IAuditLog>;
export type NewRestAuditLog = RestOf<NewAuditLog>;
export type PartialUpdateRestAuditLog = RestOf<PartialUpdateAuditLog>;

export type EntityResponseType = HttpResponse<IAuditLog>;
export type EntityArrayResponseType = HttpResponse<IAuditLog[]>;


@Injectable({ providedIn: 'root' })
export class AuditLogService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/audit-logs';

  create(payload: NewAuditLog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestAuditLog>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IAuditLog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestAuditLog>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestAuditLog>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestAuditLog[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IAuditLog | NewAuditLog | PartialUpdateAuditLog>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.performedAt)) {
      copy.performedAt = entity.performedAt.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestAuditLog): IAuditLog {
    const entity: any = { ...restEntity };
    
    if (entity.performedAt) {
        entity.performedAt = dayjs(entity.performedAt);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestAuditLog>): HttpResponse<IAuditLog> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAuditLog[]>): HttpResponse<IAuditLog[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
