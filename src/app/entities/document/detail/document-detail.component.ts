import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IDocument } from '../document.model';

@Component({
  selector: 'jhi-document-detail',
  templateUrl: './document-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class DocumentDetailComponent {
  document = input<IDocument | null>(null);

  previousState(): void {
    window.history.back();
  }
}
