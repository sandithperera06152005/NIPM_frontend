import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChequeRegistry } from '../cheque-registry.model';
import { ChequeRegistryService } from '../service/cheque-registry.service';

@Component({
  templateUrl: './cheque-registry-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChequeRegistryDeleteDialogComponent {
  chequeRegistry?: IChequeRegistry;

  protected chequeRegistryService = inject(ChequeRegistryService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.chequeRegistryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
