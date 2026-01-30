// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IStudentProfile, NewStudentProfile } from '../student-profile.model';



export type PartialUpdateStudentProfile = Partial<IStudentProfile> & Pick<IStudentProfile, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IStudentProfile | NewStudentProfile | PartialUpdateStudentProfile> = Omit<T, 'dateOfBirth' | 'createdAt'> & {

  dateOfBirth?: string | null;

  createdAt?: string | null;

};

export type RestStudentProfile = RestOf<IStudentProfile>;
export type NewRestStudentProfile = RestOf<NewStudentProfile>;
export type PartialUpdateRestStudentProfile = RestOf<PartialUpdateStudentProfile>;

export type EntityResponseType = HttpResponse<IStudentProfile>;
export type EntityArrayResponseType = HttpResponse<IStudentProfile[]>;


@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/student-profiles';

  create(payload: NewStudentProfile): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestStudentProfile>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IStudentProfile): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestStudentProfile>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestStudentProfile>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestStudentProfile[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IStudentProfile | NewStudentProfile | PartialUpdateStudentProfile>(entity: T): RestOf<T> {
    const copy: any = { ...entity };

    if (dayjs.isDayjs(entity.dateOfBirth)) {
      copy.dateOfBirth = entity.dateOfBirth.toJSON();
    }

    if (dayjs.isDayjs(entity.createdAt)) {
      copy.createdAt = entity.createdAt.toJSON();
    }

    return copy;
  }

  protected convertDateFromServer(restEntity: RestStudentProfile): IStudentProfile {
    const entity: any = { ...restEntity };

    if (entity.dateOfBirth) {
      entity.dateOfBirth = dayjs(entity.dateOfBirth);
    }

    if (entity.createdAt) {
      entity.createdAt = dayjs(entity.createdAt);
    }

    return entity;
  }

  protected convertResponseFromServer(res: HttpResponse<RestStudentProfile>): HttpResponse<IStudentProfile> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestStudentProfile[]>): HttpResponse<IStudentProfile[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
