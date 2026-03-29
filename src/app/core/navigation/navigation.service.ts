import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { AccountService } from 'app/core/auth/account.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { map, Observable, ReplaySubject, switchMap, tap } from 'rxjs';

type RoleAwareNavigationItem = FuseNavigationItem & {
    authorities?: string[];
    children?: RoleAwareNavigationItem[];
};

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _accountService = inject(AccountService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._accountService.identity().pipe(
            switchMap(account =>
                this._httpClient.get<Navigation>('api/common/navigation').pipe(
                    map(navigation => this._filterNavigationByAuthorities(navigation, account?.authorities ?? [])),
                    tap((navigation) => {
                        this._navigation.next(navigation);
                    })
                )
            )
        );
    }

    private _filterNavigationByAuthorities(navigation: Navigation, authorities: string[]): Navigation {
        if (authorities.includes('ROLE_ADMIN')) {
            return navigation;
        }

        return {
            compact: this._filterItems(navigation.compact as RoleAwareNavigationItem[]),
            default: this._filterItems(navigation.default as RoleAwareNavigationItem[]),
            futuristic: this._filterItems(navigation.futuristic as RoleAwareNavigationItem[]),
            horizontal: this._filterItems(navigation.horizontal as RoleAwareNavigationItem[]),
        };
    }

    private _filterItems(items: RoleAwareNavigationItem[]): FuseNavigationItem[] {
        const filteredItems: Array<RoleAwareNavigationItem | null> = items
            .map(item => {
                const filteredChildren = item.children?.length
                    ? this._filterItems(item.children as RoleAwareNavigationItem[])
                    : undefined;
                const hasChildren = !!filteredChildren?.length;
                const hasLink = !!item.link;
                const isAllowed = !item.authorities || item.authorities.some(authority => this._accountService.hasAnyAuthority(authority));

                if (!isAllowed && !hasChildren) {
                    return null;
                }

                if (!hasLink && !hasChildren) {
                    return null;
                }

                return {
                    ...item,
                    children: filteredChildren,
                };
            });

        return filteredItems.filter((item): item is RoleAwareNavigationItem => item !== null);
    }
}
