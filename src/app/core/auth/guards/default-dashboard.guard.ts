import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';

export const DefaultDashboardGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.identity().pipe(
    map(account => {
      const targetUrl = account?.authorities?.includes('ROLE_STUDENT')
        ? '/student-dashboard'
        : '/dashboard';

      return router.parseUrl(targetUrl);
    }),
  );
};
