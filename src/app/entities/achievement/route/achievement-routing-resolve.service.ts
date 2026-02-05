import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAchievement } from '../achievement.model';
import { AchievementService } from '../service/achievement.service';

const achievementResolve = (route: ActivatedRouteSnapshot): Observable<null | IAchievement> => {
  const id = route.params.id;
  if (id) {
    return inject(AchievementService)
      .find(id)
      .pipe(
        mergeMap((achievement: HttpResponse<IAchievement>) => {
          if (achievement.body) {
            return of(achievement.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default achievementResolve;
