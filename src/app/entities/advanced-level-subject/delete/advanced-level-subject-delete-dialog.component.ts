import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvancedLevelSubject } from '../advanced-level-subject.model';
import { AdvancedLevelSubjectService } from '../service/advanced-level-subject.service';

@Component({
  templateUrl: './advanced-level-subject-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AdvancedLevelSubjectDeleteDialogComponent {
  advancedLevelSubject?: IAdvancedLevelSubject;

  protected advancedLevelSubjectService = inject(AdvancedLevelSubjectService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.advancedLevelSubjectService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
