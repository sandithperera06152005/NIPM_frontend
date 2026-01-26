import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IJournalVoucher } from '../journal-voucher.model';
import { JournalVoucherService } from '../service/journal-voucher.service';
import { JournalVoucherFormGroup, JournalVoucherFormService } from './journal-voucher-form.service';

@Component({
  selector: 'jhi-journal-voucher-update',
  templateUrl: './journal-voucher-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class JournalVoucherUpdateComponent implements OnInit {
  isSaving = false;
  journalVoucher: IJournalVoucher | null = null;

  protected journalVoucherService = inject(JournalVoucherService);
  protected journalVoucherFormService = inject(JournalVoucherFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: JournalVoucherFormGroup = this.journalVoucherFormService.createJournalVoucherFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ journalVoucher }) => {
      this.journalVoucher = journalVoucher;
      if (journalVoucher) {
        this.updateForm(journalVoucher);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const journalVoucher = this.journalVoucherFormService.getJournalVoucher(this.editForm);
    if (journalVoucher.id !== null) {
      this.subscribeToSaveResponse(this.journalVoucherService.update(journalVoucher));
    } else {
      this.subscribeToSaveResponse(this.journalVoucherService.create(journalVoucher));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IJournalVoucher>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(journalVoucher: IJournalVoucher): void {
    this.journalVoucher = journalVoucher;
    this.journalVoucherFormService.resetForm(this.editForm, journalVoucher);
  }
}
