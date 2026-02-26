import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  query(): Observable<ICourseRegForm[]> {
    return this.http.get<ICourseRegForm[]>(this.resourceUrl);
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
}