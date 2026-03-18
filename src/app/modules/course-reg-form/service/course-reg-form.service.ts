import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewCourseRegForm } from '../course-reg-form.model';

export interface ICourseRegForm {
  id?: number;
  formName?: string;
  fileUploadPath?: string;
  formPath?: string;
}

export type EntityResponseType = HttpResponse<ICourseRegForm>;
export type EntityArrayResponseType = HttpResponse<ICourseRegForm[]>;

@Injectable({
  providedIn: 'root',
})
export class CourseRegFormService {
  private readonly http = inject(HttpClient);
  private resourceUrl = 'api/course-reg-forms'; 

  constructor() {}

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<ICourseRegForm[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  find(id: number): Observable<ICourseRegForm> {
    return this.http.get<ICourseRegForm>(`${this.resourceUrl}/${id}`);
  }

  create(form: ICourseRegForm): Observable<EntityResponseType> {
    return this.http.post<ICourseRegForm>(this.resourceUrl, form, { observe: 'response' });
  }

  update(form: ICourseRegForm): Observable<EntityResponseType> {
    return this.http.put<ICourseRegForm>(`${this.resourceUrl}/${form.id}`, form, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFormIdentifier(form: ICourseRegForm): number | undefined {
    return form.id;
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

  protected convertDateFromServer(restEntity: ICourseRegForm): ICourseRegForm {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<ICourseRegForm>): HttpResponse<ICourseRegForm> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<ICourseRegForm[]>): HttpResponse<ICourseRegForm[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}