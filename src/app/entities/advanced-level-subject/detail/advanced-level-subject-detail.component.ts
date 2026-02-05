import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IAdvancedLevelSubject } from '../advanced-level-subject.model';

@Component({
  selector: 'jhi-advanced-level-subject-detail',
  templateUrl: './advanced-level-subject-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class AdvancedLevelSubjectDetailComponent {
  advancedLevelSubject = input<IAdvancedLevelSubject | null>(null);

  previousState(): void {
    window.history.back();
  }
}
