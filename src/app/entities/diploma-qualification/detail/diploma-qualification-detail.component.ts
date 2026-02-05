import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IDiplomaQualification } from '../diploma-qualification.model';

@Component({
  selector: 'jhi-diploma-qualification-detail',
  templateUrl: './diploma-qualification-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class DiplomaQualificationDetailComponent {
  diplomaQualification = input<IDiplomaQualification | null>(null);

  previousState(): void {
    window.history.back();
  }
}
