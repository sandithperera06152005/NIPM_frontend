import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IVendorPayments } from '../vendor-payments.model';
import { VendorPaymentsService } from '../service/vendor-payments.service';
import { VendorPaymentsFormGroup, VendorPaymentsFormService } from './vendor-payments-form.service';

@Component({
  selector: 'jhi-vendor-payments-update',
  templateUrl: './vendor-payments-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class VendorPaymentsUpdateComponent implements OnInit {
  isSaving = false;
  vendorPayments: IVendorPayments | null = null;

  protected vendorPaymentsService = inject(VendorPaymentsService);
  protected vendorPaymentsFormService = inject(VendorPaymentsFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: VendorPaymentsFormGroup = this.vendorPaymentsFormService.createVendorPaymentsFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ vendorPayments }) => {
      this.vendorPayments = vendorPayments;
      if (vendorPayments) {
        this.updateForm(vendorPayments);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const vendorPayments = this.vendorPaymentsFormService.getVendorPayments(this.editForm);
    if (vendorPayments.id !== null) {
      this.subscribeToSaveResponse(this.vendorPaymentsService.update(vendorPayments));
    } else {
      this.subscribeToSaveResponse(this.vendorPaymentsService.create(vendorPayments));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVendorPayments>>): void {
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

  protected updateForm(vendorPayments: IVendorPayments): void {
    this.vendorPayments = vendorPayments;
    this.vendorPaymentsFormService.resetForm(this.editForm, vendorPayments);
  }
}
