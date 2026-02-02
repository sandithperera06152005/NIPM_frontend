import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAchievement } from '../achievement.model';
import { AchievementService } from '../service/achievement.service';

@Component({
  templateUrl: './achievement-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AchievementDeleteDialogComponent {
  achievement?: IAchievement;

  protected achievementService = inject(AchievementService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.achievementService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
