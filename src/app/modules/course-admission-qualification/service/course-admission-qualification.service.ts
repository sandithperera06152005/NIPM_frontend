// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICourseAdmissionQualification, NewCourseAdmissionQualification } from '../course-admission-qualification.model';



export type PartialUpdateCourseAdmissionQualification = Partial<ICourseAdmissionQualification> & Pick<ICourseAdmissionQualification, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---

type RestOf<T extends ICourseAdmissionQualification | NewCourseAdmissionQualification | PartialUpdateCourseAdmissionQualification> = T;

export type RestCourseAdmissionQualification = RestOf<ICourseAdmissionQualification>;
export type NewRestCourseAdmissionQualification = RestOf<NewCourseAdmissionQualification>;
export type PartialUpdateRestCourseAdmissionQualification = RestOf<PartialUpdateCourseAdmissionQualification>;

export type EntityResponseType = HttpResponse<ICourseAdmissionQualification>;
export type EntityArrayResponseType = HttpResponse<ICourseAdmissionQualification[]>;


@Injectable({ providedIn: 'root' })
export class CourseAdmissionQualificationService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/course-admission-qualifications';

  create(payload: NewCourseAdmissionQualification): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCourseAdmissionQualification>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICourseAdmissionQualification): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCourseAdmissionQualification>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCourseAdmissionQualification>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourseAdmissionQualification[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICourseAdmissionQualification | NewCourseAdmissionQualification | PartialUpdateCourseAdmissionQualification>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCourseAdmissionQualification): ICourseAdmissionQualification {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCourseAdmissionQualification>): HttpResponse<ICourseAdmissionQualification> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCourseAdmissionQualification[]>): HttpResponse<ICourseAdmissionQualification[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
