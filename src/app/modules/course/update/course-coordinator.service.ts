// src/app/entities/course-coordinator/service/course-coordinator.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ICourseCoordinator {
  id?: number;
  fullName?: string;
  teleNo?: string;
  email?: string;
  nic?: string;
  isActive?: boolean;
}

export type EntityResponseType = HttpResponse<ICourseCoordinator>;
export type EntityArrayResponseType = HttpResponse<ICourseCoordinator[]>;

@Injectable({
  providedIn: 'root',
})
export class CourseCoordinatorService {
  private readonly http = inject(HttpClient);
  private resourceUrl = 'api/course-coordinators';

  constructor() {}

  query(): Observable<ICourseCoordinator[]> {
    return this.http.get<ICourseCoordinator[]>(this.resourceUrl);
  }

  find(id: number): Observable<ICourseCoordinator> {
    return this.http.get<ICourseCoordinator>(`${this.resourceUrl}/${id}`);
  }

  create(coordinator: ICourseCoordinator): Observable<EntityResponseType> {
    return this.http.post<ICourseCoordinator>(this.resourceUrl, coordinator, { observe: 'response' });
  }

  update(coordinator: ICourseCoordinator): Observable<EntityResponseType> {
    return this.http.put<ICourseCoordinator>(`${this.resourceUrl}/${coordinator.id}`, coordinator, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getCoordinatorIdentifier(coordinator: ICourseCoordinator): number | undefined {
    return coordinator.id;
  }

}
