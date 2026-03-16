// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IMembershipAdmission, NewMembershipAdmission } from '../membership-admission.model';



export type PartialUpdateMembershipAdmission = Partial<IMembershipAdmission> & Pick<IMembershipAdmission, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends IMembershipAdmission | NewMembershipAdmission | PartialUpdateMembershipAdmission> = Omit<T, 'dateOfBirth' | 'appliedDateTime'> & {

  dateOfBirth?: string | null;

  appliedDateTime?: string | null;

};

export type RestMembershipAdmission = RestOf<IMembershipAdmission>;
export type NewRestMembershipAdmission = RestOf<NewMembershipAdmission>;
export type PartialUpdateRestMembershipAdmission = RestOf<PartialUpdateMembershipAdmission>;

export type EntityResponseType = HttpResponse<IMembershipAdmission>;
export type EntityArrayResponseType = HttpResponse<IMembershipAdmission[]>;


@Injectable({ providedIn: 'root' })
export class MembershipAdmissionService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/membership-admissions';

  create(payload: NewMembershipAdmission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestMembershipAdmission>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: IMembershipAdmission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestMembershipAdmission>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestMembershipAdmission>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestMembershipAdmission[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  sendPaymentEmail(id: number): Observable<HttpResponse<{}>> {
    return this.http.post(`${this.resourceUrl}/${id}/send-payment-email`, {}, { observe: 'response' });
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
  protected convertDateFromClient<T extends IMembershipAdmission | NewMembershipAdmission | PartialUpdateMembershipAdmission>(entity: T): RestOf<T> {
    const copy: any = { ...entity };

    if (dayjs.isDayjs(entity.dateOfBirth)) {
      copy.dateOfBirth = entity.dateOfBirth.toJSON();
    }

    if (dayjs.isDayjs(entity.appliedDateTime)) {
      copy.appliedDateTime = entity.appliedDateTime.toJSON();
    }

    return copy;
  }

  protected convertDateFromServer(restEntity: RestMembershipAdmission): IMembershipAdmission {
    const entity: any = { ...restEntity };

    if (entity.dateOfBirth) {
      entity.dateOfBirth = dayjs(entity.dateOfBirth);
    }

    if (entity.appliedDateTime) {
      entity.appliedDateTime = dayjs(entity.appliedDateTime);
    }

    return entity;
  }

  protected convertResponseFromServer(res: HttpResponse<RestMembershipAdmission>): HttpResponse<IMembershipAdmission> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMembershipAdmission[]>): HttpResponse<IMembershipAdmission[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
