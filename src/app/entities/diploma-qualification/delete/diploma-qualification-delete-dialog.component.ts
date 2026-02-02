import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDiplomaQualification } from '../diploma-qualification.model';
import { DiplomaQualificationService } from '../service/diploma-qualification.service';

@Component({
  templateUrl: './diploma-qualification-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DiplomaQualificationDeleteDialogComponent {
  diplomaQualification?: IDiplomaQualification;

  protected diplomaQualificationService = inject(DiplomaQualificationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.diplomaQualificationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
