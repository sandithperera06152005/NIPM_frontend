// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICourseAdmission, NewCourseAdmission } from '../course-admission.model';



export type PartialUpdateCourseAdmission = Partial<ICourseAdmission> & Pick<ICourseAdmission, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends ICourseAdmission | NewCourseAdmission | PartialUpdateCourseAdmission> = Omit<T, 'dateOfBirth' | 'appliedDateTime' | 'approval1DateTime' | 'approval2DateTime' | 'approval3DateTime'> & {
  
  dateOfBirth?: string | null;
  
  appliedDateTime?: string | null;
  
  approval1DateTime?: string | null;
  
  approval2DateTime?: string | null;
  
  approval3DateTime?: string | null;
  
};

export type RestCourseAdmission = RestOf<ICourseAdmission>;
export type NewRestCourseAdmission = RestOf<NewCourseAdmission>;
export type PartialUpdateRestCourseAdmission = RestOf<PartialUpdateCourseAdmission>;

export type EntityResponseType = HttpResponse<ICourseAdmission>;
export type EntityArrayResponseType = HttpResponse<ICourseAdmission[]>;


@Injectable({ providedIn: 'root' })
export class CourseAdmissionService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/course-admissions';

  create(payload: NewCourseAdmission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCourseAdmission>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICourseAdmission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCourseAdmission>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCourseAdmission>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourseAdmission[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICourseAdmission | NewCourseAdmission | PartialUpdateCourseAdmission>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.dateOfBirth)) {
      copy.dateOfBirth = entity.dateOfBirth.toJSON();
    }
    
    if (dayjs.isDayjs(entity.appliedDateTime)) {
      copy.appliedDateTime = entity.appliedDateTime.toJSON();
    }
    
    if (dayjs.isDayjs(entity.approval1DateTime)) {
      copy.approval1DateTime = entity.approval1DateTime.toJSON();
    }
    
    if (dayjs.isDayjs(entity.approval2DateTime)) {
      copy.approval2DateTime = entity.approval2DateTime.toJSON();
    }
    
    if (dayjs.isDayjs(entity.approval3DateTime)) {
      copy.approval3DateTime = entity.approval3DateTime.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCourseAdmission): ICourseAdmission {
    const entity: any = { ...restEntity };
    
    if (entity.dateOfBirth) {
        entity.dateOfBirth = dayjs(entity.dateOfBirth);
    }
    
    if (entity.appliedDateTime) {
        entity.appliedDateTime = dayjs(entity.appliedDateTime);
    }
    
    if (entity.approval1DateTime) {
        entity.approval1DateTime = dayjs(entity.approval1DateTime);
    }
    
    if (entity.approval2DateTime) {
        entity.approval2DateTime = dayjs(entity.approval2DateTime);
    }
    
    if (entity.approval3DateTime) {
        entity.approval3DateTime = dayjs(entity.approval3DateTime);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCourseAdmission>): HttpResponse<ICourseAdmission> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCourseAdmission[]>): HttpResponse<ICourseAdmission[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
