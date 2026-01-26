// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IAcademicYear, NewAcademicYear } from '../academic-year.model';



export type PartialUpdateAcademicYear = Partial<IAcademicYear> & Pick<IAcademicYear, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IAcademicYear | NewAcademicYear | PartialUpdateAcademicYear> = Omit<T, 'startDate' | 'endDate'> & {
  
  startDate?: string | null;
  
  endDate?: string | null;
  
};

export type RestAcademicYear = RestOf<IAcademicYear>;
export type NewRestAcademicYear = RestOf<NewAcademicYear>;
export type PartialUpdateRestAcademicYear = RestOf<PartialUpdateAcademicYear>;

export type EntityResponseType = HttpResponse<IAcademicYear>;
export type EntityArrayResponseType = HttpResponse<IAcademicYear[]>;


@Injectable({ providedIn: 'root' })
export class AcademicYearService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/academic-years';

  create(payload: NewAcademicYear): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestAcademicYear>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IAcademicYear): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestAcademicYear>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestAcademicYear>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestAcademicYear[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IAcademicYear | NewAcademicYear | PartialUpdateAcademicYear>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.startDate)) {
      copy.startDate = entity.startDate.toJSON();
    }
    
    if (dayjs.isDayjs(entity.endDate)) {
      copy.endDate = entity.endDate.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestAcademicYear): IAcademicYear {
    const entity: any = { ...restEntity };
    
    if (entity.startDate) {
        entity.startDate = dayjs(entity.startDate);
    }
    
    if (entity.endDate) {
        entity.endDate = dayjs(entity.endDate);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestAcademicYear>): HttpResponse<IAcademicYear> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAcademicYear[]>): HttpResponse<IAcademicYear[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
