// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICourseCoordinator, NewCourseCoordinator } from '../course-coordinator.model';



export type PartialUpdateCourseCoordinator = Partial<ICourseCoordinator> & Pick<ICourseCoordinator, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends ICourseCoordinator | NewCourseCoordinator | PartialUpdateCourseCoordinator> = T;

export type RestCourseCoordinator = RestOf<ICourseCoordinator>;
export type NewRestCourseCoordinator = RestOf<NewCourseCoordinator>;
export type PartialUpdateRestCourseCoordinator = RestOf<PartialUpdateCourseCoordinator>;

export type EntityResponseType = HttpResponse<ICourseCoordinator>;
export type EntityArrayResponseType = HttpResponse<ICourseCoordinator[]>;


@Injectable({ providedIn: 'root' })
export class CourseCoordinatorService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = `api/course-coordinators`;

  create(payload: NewCourseCoordinator): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCourseCoordinator>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICourseCoordinator): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCourseCoordinator>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCourseCoordinator>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourseCoordinator[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICourseCoordinator | NewCourseCoordinator | PartialUpdateCourseCoordinator>(entity: T): RestOf<T> {
    const copy: any = { ...entity };

    return copy;
  }

  protected convertDateFromServer(restEntity: RestCourseCoordinator): ICourseCoordinator {
    const entity: any = { ...restEntity };

    return entity;
  }

  protected convertResponseFromServer(res: HttpResponse<RestCourseCoordinator>): HttpResponse<ICourseCoordinator> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCourseCoordinator[]>): HttpResponse<ICourseCoordinator[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
