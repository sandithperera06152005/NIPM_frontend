import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewCourseCoordinator } from '../course-coordinator.model';

export interface ICourseCoordinator {
  id?: number;
  fullName?: string;
  teleNo?: string;
  email?: string;
  nic?: string;
  isActive?: boolean;
}

export type PartialUpdateCourseCoordinator = Partial<ICourseCoordinator> & Pick<ICourseCoordinator, 'id'>;

type RestOf<T extends ICourseCoordinator | NewCourseCoordinator | PartialUpdateCourseCoordinator> = Omit<T, 'createdAt' | 'lastUpdated'> & {
  createdAt?: string | null;
  lastUpdated?: string | null;
};

export type EntityResponseType = HttpResponse<ICourseCoordinator>;
export type EntityArrayResponseType = HttpResponse<ICourseCoordinator[]>;

export type RestCourseCoordinator = RestOf<ICourseCoordinator>;
export type NewRestCourseCoordinator = RestOf<NewCourseCoordinator>;
export type PartialUpdateRestCourseCoordinator = RestOf<PartialUpdateCourseCoordinator>;


@Injectable({
  providedIn: 'root',
})
export class CourseCoordinatorService {
  private readonly http = inject(HttpClient);
  private resourceUrl = 'api/course-coordinators';

  constructor() {}

  find(id: number): Observable<ICourseCoordinator> {
    return this.http.get<ICourseCoordinator>(`${this.resourceUrl}/${id}`);
  }

  create(coordinator: ICourseCoordinator): Observable<EntityResponseType> {
    return this.http.post<ICourseCoordinator>(this.resourceUrl, coordinator, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http.get<RestCourseCoordinator[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(map(res => this.convertResponseArrayFromServer(res)));
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

  protected convertDateFromServer(restEntity: ICourseCoordinator): ICourseCoordinator {
    const entity: any = { ...restEntity };
    
    return entity;
  }
  
  protected convertResponseFromServer(res: HttpResponse<ICourseCoordinator>): HttpResponse<ICourseCoordinator> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<ICourseCoordinator[]>): HttpResponse<ICourseCoordinator[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }

  

}
