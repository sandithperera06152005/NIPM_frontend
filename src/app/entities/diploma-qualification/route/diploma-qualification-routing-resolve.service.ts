import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDiplomaQualification } from '../diploma-qualification.model';
import { DiplomaQualificationService } from '../service/diploma-qualification.service';

const diplomaQualificationResolve = (route: ActivatedRouteSnapshot): Observable<null | IDiplomaQualification> => {
  const id = route.params.id;
  if (id) {
    return inject(DiplomaQualificationService)
      .find(id)
      .pipe(
        mergeMap((diplomaQualification: HttpResponse<IDiplomaQualification>) => {
          if (diplomaQualification.body) {
            return of(diplomaQualification.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default diplomaQualificationResolve;
