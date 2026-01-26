import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICustomerPayments } from '../customer-payments.model';
import { CustomerPaymentsService } from '../service/customer-payments.service';
import { CustomerPaymentsFormGroup, CustomerPaymentsFormService } from './customer-payments-form.service';

@Component({
  selector: 'jhi-customer-payments-update',
  templateUrl: './customer-payments-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class CustomerPaymentsUpdateComponent implements OnInit {
  isSaving = false;
  customerPayments: ICustomerPayments | null = null;

  protected customerPaymentsService = inject(CustomerPaymentsService);
  protected customerPaymentsFormService = inject(CustomerPaymentsFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: CustomerPaymentsFormGroup = this.customerPaymentsFormService.createCustomerPaymentsFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ customerPayments }) => {
      this.customerPayments = customerPayments;
      if (customerPayments) {
        this.updateForm(customerPayments);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const customerPayments = this.customerPaymentsFormService.getCustomerPayments(this.editForm);
    if (customerPayments.id !== null) {
      this.subscribeToSaveResponse(this.customerPaymentsService.update(customerPayments));
    } else {
      this.subscribeToSaveResponse(this.customerPaymentsService.create(customerPayments));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICustomerPayments>>): void {
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

  protected updateForm(customerPayments: ICustomerPayments): void {
    this.customerPayments = customerPayments;
    this.customerPaymentsFormService.resetForm(this.editForm, customerPayments);
  }
}
