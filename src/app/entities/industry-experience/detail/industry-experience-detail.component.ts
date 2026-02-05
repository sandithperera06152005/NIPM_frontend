import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IIndustryExperience } from '../industry-experience.model';

@Component({
  selector: 'jhi-industry-experience-detail',
  templateUrl: './industry-experience-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class IndustryExperienceDetailComponent {
  industryExperience = input<IIndustryExperience | null>(null);

  previousState(): void {
    window.history.back();
  }
}
