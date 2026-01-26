import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IChequeRegistry } from '../cheque-registry.model';
import { ChequeRegistryService } from '../service/cheque-registry.service';
import { ChequeRegistryFormGroup, ChequeRegistryFormService } from './cheque-registry-form.service';

@Component({
  selector: 'jhi-cheque-registry-update',
  templateUrl: './cheque-registry-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChequeRegistryUpdateComponent implements OnInit {
  isSaving = false;
  chequeRegistry: IChequeRegistry | null = null;

  protected chequeRegistryService = inject(ChequeRegistryService);
  protected chequeRegistryFormService = inject(ChequeRegistryFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChequeRegistryFormGroup = this.chequeRegistryFormService.createChequeRegistryFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ chequeRegistry }) => {
      this.chequeRegistry = chequeRegistry;
      if (chequeRegistry) {
        this.updateForm(chequeRegistry);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const chequeRegistry = this.chequeRegistryFormService.getChequeRegistry(this.editForm);
    if (chequeRegistry.id !== null) {
      this.subscribeToSaveResponse(this.chequeRegistryService.update(chequeRegistry));
    } else {
      this.subscribeToSaveResponse(this.chequeRegistryService.create(chequeRegistry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChequeRegistry>>): void {
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

  protected updateForm(chequeRegistry: IChequeRegistry): void {
    this.chequeRegistry = chequeRegistry;
    this.chequeRegistryFormService.resetForm(this.editForm, chequeRegistry);
  }
}
