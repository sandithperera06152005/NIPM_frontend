import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IVoucher } from '../voucher.model';
import { VoucherService } from '../service/voucher.service';
import { VoucherFormGroup, VoucherFormService } from './voucher-form.service';

@Component({
  selector: 'jhi-voucher-update',
  templateUrl: './voucher-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class VoucherUpdateComponent implements OnInit {
  isSaving = false;
  voucher: IVoucher | null = null;

  protected voucherService = inject(VoucherService);
  protected voucherFormService = inject(VoucherFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: VoucherFormGroup = this.voucherFormService.createVoucherFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ voucher }) => {
      this.voucher = voucher;
      if (voucher) {
        this.updateForm(voucher);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const voucher = this.voucherFormService.getVoucher(this.editForm);
    if (voucher.id !== null) {
      this.subscribeToSaveResponse(this.voucherService.update(voucher));
    } else {
      this.subscribeToSaveResponse(this.voucherService.create(voucher));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVoucher>>): void {
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

  protected updateForm(voucher: IVoucher): void {
    this.voucher = voucher;
    this.voucherFormService.resetForm(this.editForm, voucher);
  }
}
