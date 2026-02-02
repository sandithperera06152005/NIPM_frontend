import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEmployment } from '../employment.model';
import { EmploymentService } from '../service/employment.service';

const employmentResolve = (route: ActivatedRouteSnapshot): Observable<null | IEmployment> => {
  const id = route.params.id;
  if (id) {
    return inject(EmploymentService)
      .find(id)
      .pipe(
        mergeMap((employment: HttpResponse<IEmployment>) => {
          if (employment.body) {
            return of(employment.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default employmentResolve;
