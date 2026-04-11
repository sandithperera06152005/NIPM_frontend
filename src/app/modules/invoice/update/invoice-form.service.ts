import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IInvoice, NewInvoice } from '../invoice.model';



type InvoiceFormGroupInput = IInvoice | Partial<NewInvoice>;
type InvoiceFormRawValue = IInvoice;
export type InvoiceFormGroup = FormGroup<{
  id: FormControl<IInvoice['id'] | NewInvoice['id']>;
  
  invoiceNo: FormControl<IInvoice['invoiceNo']>;
  
  issuedDate: FormControl<IInvoice['issuedDate']>;
  
  dueDate: FormControl<IInvoice['dueDate']>;
  
  totalAmount: FormControl<IInvoice['totalAmount']>;
  
  paidAmount: FormControl<IInvoice['paidAmount']>;

  document: FormControl<IInvoice['document'] | null>;
  
  
}>;

@Injectable({ providedIn: 'root' })
export class InvoiceFormService {
  createInvoiceFormGroup(entity: InvoiceFormGroupInput = { id: null }): InvoiceFormGroup {
    const form = new FormGroup({
      id: new FormControl(
        { value: entity.id, disabled: true },
        { nonNullable: true, validators: [Validators.required] }
      ),
      
      invoiceNo: new FormControl(entity.invoiceNo),
      
      issuedDate: new FormControl(entity.issuedDate),
      
      dueDate: new FormControl(entity.dueDate),
      
      totalAmount: new FormControl(entity.totalAmount),
      
      paidAmount: new FormControl(entity.paidAmount),
      
      document: new FormControl(entity.document),
      
    });
    return form;
  }
  

  getInvoice(form: InvoiceFormGroup): IInvoice | NewInvoice {
    return form.getRawValue() as IInvoice | NewInvoice;
  }

  resetForm(form: InvoiceFormGroup, entity: InvoiceFormGroupInput): void {
    form.reset({
      ...entity,
      
    } as any);
    form.controls.id.setValue(entity.id);
  }
}
