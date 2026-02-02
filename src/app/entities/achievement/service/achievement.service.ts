import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Search } from 'app/core/request/request.model';
import { IAchievement, NewAchievement } from '../achievement.model';

export type PartialUpdateAchievement = Partial<IAchievement> & Pick<IAchievement, 'id'>;

export type EntityResponseType = HttpResponse<IAchievement>;
export type EntityArrayResponseType = HttpResponse<IAchievement[]>;

@Injectable({ providedIn: 'root' })
export class AchievementService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/achievements');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/achievements/_search');

  create(achievement: NewAchievement): Observable<EntityResponseType> {
    return this.http.post<IAchievement>(this.resourceUrl, achievement, { observe: 'response' });
  }

  update(achievement: IAchievement): Observable<EntityResponseType> {
    return this.http.put<IAchievement>(`${this.resourceUrl}/${this.getAchievementIdentifier(achievement)}`, achievement, {
      observe: 'response',
    });
  }

  partialUpdate(achievement: PartialUpdateAchievement): Observable<EntityResponseType> {
    return this.http.patch<IAchievement>(`${this.resourceUrl}/${this.getAchievementIdentifier(achievement)}`, achievement, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAchievement>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAchievement[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAchievement[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IAchievement[]>()], asapScheduler)));
  }

  getAchievementIdentifier(achievement: Pick<IAchievement, 'id'>): number {
    return achievement.id;
  }

  compareAchievement(o1: Pick<IAchievement, 'id'> | null, o2: Pick<IAchievement, 'id'> | null): boolean {
    return o1 && o2 ? this.getAchievementIdentifier(o1) === this.getAchievementIdentifier(o2) : o1 === o2;
  }

  addAchievementToCollectionIfMissing<Type extends Pick<IAchievement, 'id'>>(
    achievementCollection: Type[],
    ...achievementsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const achievements: Type[] = achievementsToCheck.filter(isPresent);
    if (achievements.length > 0) {
      const achievementCollectionIdentifiers = achievementCollection.map(achievementItem => this.getAchievementIdentifier(achievementItem));
      const achievementsToAdd = achievements.filter(achievementItem => {
        const achievementIdentifier = this.getAchievementIdentifier(achievementItem);
        if (achievementCollectionIdentifiers.includes(achievementIdentifier)) {
          return false;
        }
        achievementCollectionIdentifiers.push(achievementIdentifier);
        return true;
      });
      return [...achievementsToAdd, ...achievementCollection];
    }
    return achievementCollection;
  }
}
