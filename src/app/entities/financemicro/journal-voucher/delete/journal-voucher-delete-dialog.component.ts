import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IJournalVoucher } from '../journal-voucher.model';
import { JournalVoucherService } from '../service/journal-voucher.service';

@Component({
  templateUrl: './journal-voucher-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class JournalVoucherDeleteDialogComponent {
  journalVoucher?: IJournalVoucher;

  protected journalVoucherService = inject(JournalVoucherService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.journalVoucherService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
