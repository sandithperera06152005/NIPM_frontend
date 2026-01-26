import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IVendorPayments } from '../vendor-payments.model';
import { VendorPaymentsService } from '../service/vendor-payments.service';

const vendorPaymentsResolve = (route: ActivatedRouteSnapshot): Observable<null | IVendorPayments> => {
  const id = route.params.id;
  if (id) {
    return inject(VendorPaymentsService)
      .find(id)
      .pipe(
        mergeMap((vendorPayments: HttpResponse<IVendorPayments>) => {
          if (vendorPayments.body) {
            return of(vendorPayments.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default vendorPaymentsResolve;
