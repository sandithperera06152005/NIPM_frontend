import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IVendorPayments } from '../vendor-payments.model';
import { VendorPaymentsService } from '../service/vendor-payments.service';

@Component({
  templateUrl: './vendor-payments-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class VendorPaymentsDeleteDialogComponent {
  vendorPayments?: IVendorPayments;

  protected vendorPaymentsService = inject(VendorPaymentsService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.vendorPaymentsService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
