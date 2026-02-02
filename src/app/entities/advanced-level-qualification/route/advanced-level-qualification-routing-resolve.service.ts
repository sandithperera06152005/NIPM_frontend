import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from '../service/advanced-level-qualification.service';

const advancedLevelQualificationResolve = (route: ActivatedRouteSnapshot): Observable<null | IAdvancedLevelQualification> => {
  const id = route.params.id;
  if (id) {
    return inject(AdvancedLevelQualificationService)
      .find(id)
      .pipe(
        mergeMap((advancedLevelQualification: HttpResponse<IAdvancedLevelQualification>) => {
          if (advancedLevelQualification.body) {
            return of(advancedLevelQualification.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default advancedLevelQualificationResolve;
