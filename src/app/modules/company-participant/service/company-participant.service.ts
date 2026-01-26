// This is an EJS template. It generates the main data service for the entity.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ICompanyParticipant, NewCompanyParticipant } from '../company-participant.model';



export type PartialUpdateCompanyParticipant = Partial<ICompanyParticipant> & Pick<ICompanyParticipant, 'id'>;

// --- Define REST-safe types by converting Dayjs objects to strings ---
type RestOf<T extends ICompanyParticipant | NewCompanyParticipant | PartialUpdateCompanyParticipant> = Omit<T, 'joinedAt'> & {
  
  joinedAt?: string | null;
  
};

export type RestCompanyParticipant = RestOf<ICompanyParticipant>;
export type NewRestCompanyParticipant = RestOf<NewCompanyParticipant>;
export type PartialUpdateRestCompanyParticipant = RestOf<PartialUpdateCompanyParticipant>;

export type EntityResponseType = HttpResponse<ICompanyParticipant>;
export type EntityArrayResponseType = HttpResponse<ICompanyParticipant[]>;


@Injectable({ providedIn: 'root' })
export class CompanyParticipantService {
  protected readonly http = inject(HttpClient);

  // FIX: Ensure the microservice name from the config is always lowercase in the URL.
  protected resourceUrl = 'api/company-participants';

  create(payload: NewCompanyParticipant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.post<RestCompanyParticipant>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payload: ICompanyParticipant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http.put<RestCompanyParticipant>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<RestCompanyParticipant>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCompanyParticipant[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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
  protected convertDateFromClient<T extends ICompanyParticipant | NewCompanyParticipant | PartialUpdateCompanyParticipant>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    
    if (dayjs.isDayjs(entity.joinedAt)) {
      copy.joinedAt = entity.joinedAt.toJSON();
    }
    
    return copy;
  }

  protected convertDateFromServer(restEntity: RestCompanyParticipant): ICompanyParticipant {
    const entity: any = { ...restEntity };
    
    if (entity.joinedAt) {
        entity.joinedAt = dayjs(entity.joinedAt);
    }
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<RestCompanyParticipant>): HttpResponse<ICompanyParticipant> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCompanyParticipant[]>): HttpResponse<ICompanyParticipant[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
