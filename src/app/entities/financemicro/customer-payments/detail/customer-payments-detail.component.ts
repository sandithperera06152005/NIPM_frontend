import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { ICustomerPayments } from '../customer-payments.model';

@Component({
  selector: 'jhi-customer-payments-detail',
  templateUrl: './customer-payments-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class CustomerPaymentsDetailComponent {
  customerPayments = input<ICustomerPayments | null>(null);

  previousState(): void {
    window.history.back();
  }
}
