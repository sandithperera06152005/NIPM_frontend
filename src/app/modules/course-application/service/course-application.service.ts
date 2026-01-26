// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICourseApplication, NewCourseApplication } from '../course-application.model';



export type PartialUpdateCourseApplication = Partial<ICourseApplication> & Pick<ICourseApplication, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends ICourseApplication | NewCourseApplication | PartialUpdateCourseApplication> = Omit<T, 'applicationDate'> & {
  
  applicationDate?: string | null;
  
};

export type RestCourseApplication = RestOf<ICourseApplication>;
export type NewRestCourseApplication = RestOf<NewCourseApplication>;
export type PartialUpdateRestCourseApplication = RestOf<PartialUpdateCourseApplication>;

export type EntityResponseType = HttpResponse<ICourseApplication>;
export type EntityArrayResponseType = HttpResponse<ICourseApplication[]>;


@Injectable({ providedIn: 'root' })
export class CourseApplicationService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/course-applications';

  create(payload: NewCourseApplication): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCourseApplication>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICourseApplication): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCourseApplication>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCourseApplication>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourseApplication[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICourseApplication | NewCourseApplication | PartialUpdateCourseApplication>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.applicationDate)) {
      copy.applicationDate = entity.applicationDate.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCourseApplication): ICourseApplication {
    const entity: any = { ...restEntity };
    
    if (entity.applicationDate) {
        entity.applicationDate = dayjs(entity.applicationDate);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCourseApplication>): HttpResponse<ICourseApplication> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCourseApplication[]>): HttpResponse<ICourseApplication[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
