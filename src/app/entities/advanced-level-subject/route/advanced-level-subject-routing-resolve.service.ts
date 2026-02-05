import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import { AdvancedLevelSubjectService } from '../service/advanced-level-subject.service';

const advancedLevelSubjectResolve = (route: ActivatedRouteSnapshot): Observable<null | IAdvancedLevelSubject> => {
  const id = route.params.id;
  if (id) {
    return inject(AdvancedLevelSubjectService)
      .find(id)
      .pipe(
        mergeMap((advancedLevelSubject: HttpResponse<IAdvancedLevelSubject>) => {
          if (advancedLevelSubject.body) {
            return of(advancedLevelSubject.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default advancedLevelSubjectResolve;
