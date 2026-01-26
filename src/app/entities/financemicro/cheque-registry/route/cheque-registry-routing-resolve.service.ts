import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChequeRegistry } from '../cheque-registry.model';
import { ChequeRegistryService } from '../service/cheque-registry.service';

const chequeRegistryResolve = (route: ActivatedRouteSnapshot): Observable<null | IChequeRegistry> => {
  const id = route.params.id;
  if (id) {
    return inject(ChequeRegistryService)
      .find(id)
      .pipe(
        mergeMap((chequeRegistry: HttpResponse<IChequeRegistry>) => {
          if (chequeRegistry.body) {
            return of(chequeRegistry.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default chequeRegistryResolve;
