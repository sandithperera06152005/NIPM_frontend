import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IAdvancedLevelQualification } from '../advanced-level-qualification.model';

@Component({
  selector: 'jhi-advanced-level-qualification-detail',
  templateUrl: './advanced-level-qualification-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class AdvancedLevelQualificationDetailComponent {
  advancedLevelQualification = input<IAdvancedLevelQualification | null>(null);

  previousState(): void {
    window.history.back();
  }
}
