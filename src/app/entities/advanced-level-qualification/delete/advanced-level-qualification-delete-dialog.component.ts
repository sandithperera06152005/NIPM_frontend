import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from '../service/advanced-level-qualification.service';

@Component({
  templateUrl: './advanced-level-qualification-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AdvancedLevelQualificationDeleteDialogComponent {
  advancedLevelQualification?: IAdvancedLevelQualification;

  protected advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.advancedLevelQualificationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
