import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IChequeRegistry } from '../cheque-registry.model';

@Component({
  selector: 'jhi-cheque-registry-detail',
  templateUrl: './cheque-registry-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class ChequeRegistryDetailComponent {
  chequeRegistry = input<IChequeRegistry | null>(null);

  previousState(): void {
    window.history.back();
  }
}
