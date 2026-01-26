// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICourse, NewCourse } from '../course.model';



export type PartialUpdateCourse = Partial<ICourse> & Pick<ICourse, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---

type RestOf<T extends ICourse | NewCourse | PartialUpdateCourse> = T;


export type RestCourse = RestOf<ICourse>;
export type NewRestCourse = RestOf<NewCourse>;
export type PartialUpdateRestCourse = RestOf<PartialUpdateCourse>;

export type EntityResponseType = HttpResponse<ICourse>;
export type EntityArrayResponseType = HttpResponse<ICourse[]>;


@Injectable({ providedIn: 'root' })
export class CourseService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/courses';

  create(payload: NewCourse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCourse>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICourse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCourse>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCourse>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourse[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICourse | NewCourse | PartialUpdateCourse>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCourse): ICourse {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCourse>): HttpResponse<ICourse> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCourse[]>): HttpResponse<ICourse[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
