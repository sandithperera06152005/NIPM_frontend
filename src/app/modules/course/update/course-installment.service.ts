import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ICourseInstallment {
  id?: number;
  installmentNo: number;
  installmentFee: number;
  course?: { id: number } | null;
}

@Injectable({ providedIn: 'root' })
export class CourseInstallmentService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = '/api/course-installments';

  create(installment: ICourseInstallment): Observable<ICourseInstallment> {
    return this.http.post<ICourseInstallment>(this.resourceUrl, installment);
  }

  update(installment: ICourseInstallment): Observable<ICourseInstallment> {
    return this.http.put<ICourseInstallment>(
      `${this.resourceUrl}/${installment.id}`,
      installment
    );
  }

  find(id: number): Observable<ICourseInstallment> {
    return this.http.get<ICourseInstallment>(`${this.resourceUrl}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}

