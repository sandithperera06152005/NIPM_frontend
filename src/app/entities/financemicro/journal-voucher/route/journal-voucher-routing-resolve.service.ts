import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IJournalVoucher } from '../journal-voucher.model';
import { JournalVoucherService } from '../service/journal-voucher.service';

const journalVoucherResolve = (route: ActivatedRouteSnapshot): Observable<null | IJournalVoucher> => {
  const id = route.params.id;
  if (id) {
    return inject(JournalVoucherService)
      .find(id)
      .pipe(
        mergeMap((journalVoucher: HttpResponse<IJournalVoucher>) => {
          if (journalVoucher.body) {
            return of(journalVoucher.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default journalVoucherResolve;
