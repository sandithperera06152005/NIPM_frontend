import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, map, scheduled, tap } from 'rxjs';

import { catchError } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { IAccounts, NewAccounts } from '../accounts.model';
import { TransactionService } from 'app/entities/financemicro/transaction/service/transaction.service';
import { NewTransaction } from 'app/entities/financemicro/transaction/transaction.model';

export type PartialUpdateAccounts = Partial<IAccounts> & Pick<IAccounts, 'id'>;

type RestOf<T extends IAccounts | NewAccounts> = Omit<T, 'date' | 'lmd'> & {
  date?: string | null;
  lmd?: string | null;
};

export type RestAccounts = RestOf<IAccounts>;

export type NewRestAccounts = RestOf<NewAccounts>;

export type PartialUpdateRestAccounts = RestOf<PartialUpdateAccounts>;

export type EntityResponseType = HttpResponse<IAccounts>;
export type EntityArrayResponseType = HttpResponse<IAccounts[]>;

@Injectable({ providedIn: 'root' })
export class AccountsService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly transactionService = inject(TransactionService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/accounts', 'financemicro');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/accounts/_search', 'financemicro');

  // Store previous account state to calculate changes
  private previousAccountState = new Map<number, { debitAmount: number; creditAmount: number }>();

  create(accounts: NewAccounts): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(accounts);
    return this.http
      .post<RestAccounts>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(
        map(res => this.convertResponseFromServer(res)),
        tap((res) => {
          if (res.body) {
            // For CREATE, record the initial amounts as changes
            this.recordTransaction(res.body, 'CREATE', res.body.debitAmount || 0, res.body.creditAmount || 0);
            // Store the initial state
            this.previousAccountState.set(res.body.id, {
              debitAmount: res.body.debitAmount || 0,
              creditAmount: res.body.creditAmount || 0
            });
          }
        })
      );
  }

  update(accounts: IAccounts): Observable<EntityResponseType> {
    // Get previous state before update
    const previousState = this.previousAccountState.get(accounts.id);
    
    const copy = this.convertDateFromClient(accounts);
    return this.http
      .put<RestAccounts>(`${this.resourceUrl}/${this.getAccountsIdentifier(accounts)}`, copy, { observe: 'response' })
      .pipe(
        map(res => this.convertResponseFromServer(res)),
        tap((res) => {
          if (res.body) {
            // Calculate changes from previous state
            const debitChange = (res.body.debitAmount || 0) - (previousState?.debitAmount || 0);
            const creditChange = (res.body.creditAmount || 0) - (previousState?.creditAmount || 0);
            
            // Only record transaction if there were actual changes
            if (debitChange !== 0 || creditChange !== 0) {
              this.recordTransaction(res.body, 'UPDATE', debitChange, creditChange);
            }
            
            // Update stored state
            this.previousAccountState.set(res.body.id, {
              debitAmount: res.body.debitAmount || 0,
              creditAmount: res.body.creditAmount || 0
            });
          }
        })
      );
  }

  partialUpdate(accounts: PartialUpdateAccounts): Observable<EntityResponseType> {
    // Get previous state before partial update
    const previousState = this.previousAccountState.get(accounts.id);
    
    const copy = this.convertDateFromClient(accounts);
    return this.http
      .patch<RestAccounts>(`${this.resourceUrl}/${this.getAccountsIdentifier(accounts)}`, copy, { observe: 'response' })
      .pipe(
        map(res => this.convertResponseFromServer(res)),
        tap((res) => {
          if (res.body) {
            // Calculate changes from previous state
            const currentDebit = res.body.debitAmount || 0;
            const currentCredit = res.body.creditAmount || 0;
            const debitChange = currentDebit - (previousState?.debitAmount || 0);
            const creditChange = currentCredit - (previousState?.creditAmount || 0);
            
            // Only record transaction if there were actual changes
            if (debitChange !== 0 || creditChange !== 0) {
              this.recordTransaction(res.body, 'UPDATE', debitChange, creditChange);
            }
            
            // Update stored state
            this.previousAccountState.set(res.body.id, {
              debitAmount: currentDebit,
              creditAmount: currentCredit
            });
          }
        })
      );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAccounts>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(
        map(res => this.convertResponseFromServer(res)),
        tap((res) => {
          if (res.body) {
            // Store state when account is fetched
            this.previousAccountState.set(res.body.id, {
              debitAmount: res.body.debitAmount || 0,
              creditAmount: res.body.creditAmount || 0
            });
          }
        })
      );
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAccounts[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(
        map(res => this.convertResponseArrayFromServer(res)),
        tap((res) => {
          // Store states for all accounts in query result
          if (res.body) {
            res.body.forEach(account => {
              this.previousAccountState.set(account.id, {
                debitAmount: account.debitAmount || 0,
                creditAmount: account.creditAmount || 0
              });
            });
          }
        })
      );
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    // Remove from state tracking when deleted
    this.previousAccountState.delete(id);
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<RestAccounts[]>(this.resourceSearchUrl, { params: options, observe: 'response' }).pipe(
      map(res => this.convertResponseArrayFromServer(res)),
      tap((res) => {
        // Store states for all accounts in search result
        if (res.body) {
          res.body.forEach(account => {
            this.previousAccountState.set(account.id, {
              debitAmount: account.debitAmount || 0,
              creditAmount: account.creditAmount || 0
            });
          });
        }
      }),
      catchError(() => scheduled([new HttpResponse<IAccounts[]>()], asapScheduler)),
    );
  }

  // Updated recordTransaction method to accept change amounts
  private recordTransaction(account: IAccounts, action: 'CREATE' | 'UPDATE', debitChange: number, creditChange: number): void {
    const transactionData: NewTransaction = {
      id: null,
      accountCode: account.code,
      debit: debitChange, // Record only the CHANGE in debit
      credit: creditChange, // Record only the CHANGE in credit
      date: dayjs(new Date()),
      refDoc: account.name,
      source: account.parent
    };

    this.transactionService.create(transactionData).subscribe({
      next: (response) => {
        console.log(`Transaction recorded for ${action}: Debit +${debitChange}, Credit +${creditChange}`);
      },
      error: (error) => {
        console.error('Error recording transaction:', error);
      }
    });
  }

  getAccountsIdentifier(accounts: Pick<IAccounts, 'id'>): number {
    return accounts.id;
  }

  compareAccounts(o1: Pick<IAccounts, 'id'> | null, o2: Pick<IAccounts, 'id'> | null): boolean {
    return o1 && o2 ? this.getAccountsIdentifier(o1) === this.getAccountsIdentifier(o2) : o1 === o2;
  }

  addAccountsToCollectionIfMissing<Type extends Pick<IAccounts, 'id'>>(
    accountsCollection: Type[],
    ...accountsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const accounts: Type[] = accountsToCheck.filter(isPresent);
    if (accounts.length > 0) {
      const accountsCollectionIdentifiers = accountsCollection.map(accountsItem => this.getAccountsIdentifier(accountsItem));
      const accountsToAdd = accounts.filter(accountsItem => {
        const accountsIdentifier = this.getAccountsIdentifier(accountsItem);
        if (accountsCollectionIdentifiers.includes(accountsIdentifier)) {
          return false;
        }
        accountsCollectionIdentifiers.push(accountsIdentifier);
        return true;
      });
      return [...accountsToAdd, ...accountsCollection];
    }
    return accountsCollection;
  }

  protected convertDateFromClient<T extends IAccounts | NewAccounts | PartialUpdateAccounts>(accounts: T): RestOf<T> {
    return {
      ...accounts,
      date: accounts.date?.toJSON() ?? null,
      lmd: accounts.lmd?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAccounts: RestAccounts): IAccounts {
    return {
      ...restAccounts,
      date: restAccounts.date ? dayjs(restAccounts.date) : undefined,
      lmd: restAccounts.lmd ? dayjs(restAccounts.lmd) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAccounts>): HttpResponse<IAccounts> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAccounts[]>): HttpResponse<IAccounts[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
