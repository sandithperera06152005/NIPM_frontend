// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IMembershipCategory, NewMembershipCategory } from '../membership-category.model';



export type PartialUpdateMembershipCategory = Partial<IMembershipCategory> & Pick<IMembershipCategory, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IMembershipCategory | NewMembershipCategory | PartialUpdateMembershipCategory> = Omit<T, 'startDate' | 'endDate'> & {

  startDate?: string | null;

  endDate?: string | null;

};

export type RestMembershipCategory = RestOf<IMembershipCategory>;
export type NewRestMembershipCategory = RestOf<NewMembershipCategory>;
export type PartialUpdateRestMembershipCategory = RestOf<PartialUpdateMembershipCategory>;

export type EntityResponseType = HttpResponse<IMembershipCategory>;
export type EntityArrayResponseType = HttpResponse<IMembershipCategory[]>;


@Injectable({ providedIn: 'root' })
export class MembershipCategoryService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/membership-categories';

  create(payload: NewMembershipCategory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    const { id, ...data } = copy; // Omit id for create
    return this.http.post<RestMembershipCategory>(this.resourceUrl, data, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IMembershipCategory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestMembershipCategory>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestMembershipCategory>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestMembershipCategory[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends IMembershipCategory | NewMembershipCategory | PartialUpdateMembershipCategory>(entity: T): RestOf<T> {
    const copy: any = { ...entity };

    if (entity.startDate) {
      if (dayjs.isDayjs(entity.startDate)) {
        copy.startDate = entity.startDate.toJSON();
      } else if ((entity.startDate as any) instanceof Date) {
        copy.startDate = dayjs(entity.startDate).toJSON();
      }
    }

    if (entity.endDate) {
      if (dayjs.isDayjs(entity.endDate)) {
        copy.endDate = entity.endDate.toJSON();
      } else if ((entity.endDate as any) instanceof Date) {
        copy.endDate = dayjs(entity.endDate).toJSON();
      }
    }

    return copy;
  }

  protected convertDateFromServer(restEntity: RestMembershipCategory): IMembershipCategory {
    const entity: any = { ...restEntity };

    if (entity.startDate) {
      entity.startDate = dayjs(entity.startDate);
    }

    if (entity.endDate) {
      entity.endDate = dayjs(entity.endDate);
    }

    return entity;
  }

  protected convertResponseFromServer(res: HttpResponse<RestMembershipCategory>): HttpResponse<IMembershipCategory> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMembershipCategory[]>): HttpResponse<IMembershipCategory[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
