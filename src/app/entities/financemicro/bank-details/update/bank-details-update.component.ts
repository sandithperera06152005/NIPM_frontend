import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IBankDetails } from '../bank-details.model';
import { BankDetailsService } from '../service/bank-details.service';
import { BankDetailsFormGroup, BankDetailsFormService } from './bank-details-form.service';

@Component({
  selector: 'jhi-bank-details-update',
  templateUrl: './bank-details-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class BankDetailsUpdateComponent implements OnInit {
  isSaving = false;
  bankDetails: IBankDetails | null = null;

  protected bankDetailsService = inject(BankDetailsService);
  protected bankDetailsFormService = inject(BankDetailsFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: BankDetailsFormGroup = this.bankDetailsFormService.createBankDetailsFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ bankDetails }) => {
      this.bankDetails = bankDetails;
      if (bankDetails) {
        this.updateForm(bankDetails);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const bankDetails = this.bankDetailsFormService.getBankDetails(this.editForm);
    if (bankDetails.id !== null) {
      this.subscribeToSaveResponse(this.bankDetailsService.update(bankDetails));
    } else {
      this.subscribeToSaveResponse(this.bankDetailsService.create(bankDetails));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBankDetails>>): void {
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

  protected updateForm(bankDetails: IBankDetails): void {
    this.bankDetails = bankDetails;
    this.bankDetailsFormService.resetForm(this.editForm, bankDetails);
  }
}
