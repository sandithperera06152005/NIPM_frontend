import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IIndustryExperience } from '../industry-experience.model';
import { IndustryExperienceService } from '../service/industry-experience.service';

const industryExperienceResolve = (route: ActivatedRouteSnapshot): Observable<null | IIndustryExperience> => {
  const id = route.params.id;
  if (id) {
    return inject(IndustryExperienceService)
      .find(id)
      .pipe(
        mergeMap((industryExperience: HttpResponse<IIndustryExperience>) => {
          if (industryExperience.body) {
            return of(industryExperience.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default industryExperienceResolve;
