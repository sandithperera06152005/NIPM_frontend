import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IEmployment } from '../employment.model';
import { EmploymentService } from '../service/employment.service';

@Component({
  templateUrl: './employment-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class EmploymentDeleteDialogComponent {
  employment?: IEmployment;

  protected employmentService = inject(EmploymentService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.employmentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
