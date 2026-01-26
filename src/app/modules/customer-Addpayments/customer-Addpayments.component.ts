import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentTransferService } from 'app/entities/financemicro/service/payment-transfer.service';
import { ReceiptCreateComponent } from '../receipt-create/receipt-create.component';
import { CustomerPaymentsService } from 'app/entities/financemicro/customer-payments/service/customer-payments.service';
import { NewCustomerPayments } from 'app/entities/financemicro/customer-payments/customer-payments.model';
import { InvoiceService } from 'app/entities/operationsModuleCooperation/invoice/service/invoice.service';
import { IInvoice } from 'app/entities/operationsModuleCooperation/invoice/invoice.model';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'app-customer-Addpayments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './customer-Addpayments.component.html',
  styleUrls: ['./customer-Addpayments.component.scss']
})
export class CustomerAddPaymentsComponent implements OnInit {

  paymentForm: FormGroup;
  selectedInvoices: any[] = [];
  totalEnteredAmount: number = 0;
  totalOwingAmount: number = 0;

  // Array to store payment lines
  paymentLines: { serial: number; description: string; amount: number; date: Date }[] = [];
  totalSettlementValue: number = 0;
  isSaving: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<CustomerAddPaymentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paymentTransferService: PaymentTransferService,
    private customerPaymentsService: CustomerPaymentsService,
    private dialog: MatDialog,
    private invoiceService: InvoiceService 
  ) {
    this.selectedInvoices = data.invoices || [];
    
    this.totalEnteredAmount = this.selectedInvoices.reduce((sum, invoice) => sum + (invoice.enteredAmount || 0), 0);
    this.totalOwingAmount = this.selectedInvoices.reduce((sum, invoice) => sum + (invoice.totalNetAmount || 0), 0);

    this.paymentForm = this._fb.group({
    });

    // Clear payment data when dialog is closed (by any means)
    this._dialogRef.afterClosed().subscribe((result) => {
      if (!result || !result.success) {
        // Clear payment data if dialog was closed without successful payment
        this.paymentTransferService.clearPayments();
      }
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    // Create payment lines from all selected invoices with their entered amounts
    this.paymentLines = [];
    let serial = 1;

    this.selectedInvoices.forEach(invoice => {
      if (invoice.enteredAmount && invoice.enteredAmount > 0) {
        this.paymentLines.push({
          serial: serial++,
          description: `Invoice: ${invoice.invoiceNumber} - ${invoice.vehicleLicenseNumber}`,
          amount: invoice.enteredAmount,
          date: new Date(),
        });
      }
    });

    this.totalSettlementValue = this.paymentLines.reduce((sum, line) => sum + line.amount, 0);
  }

onSavePayments() {
  if (this.paymentLines.length === 0) {
    alert('No payment lines to save.');
    return;
  }

  this.isSaving = true;

  //  FIX: Create payment lines with proper description that includes vehicle owner name
  this.paymentLines = [];
  let serial = 1;

  this.selectedInvoices.forEach(invoice => {
    if (invoice.enteredAmount && invoice.enteredAmount > 0) {
      this.paymentLines.push({
        serial: serial++,
        description: `Invoice: ${invoice.invoiceNumber} - ${invoice.vehicleLicenseNumber} - ${invoice.vehicleOwnerName}`,
        amount: invoice.enteredAmount,
        date: new Date(),
      });
    }
  });

  this.totalSettlementValue = this.paymentLines.reduce((sum, line) => sum + line.amount, 0);

  // Save each payment line to backend
  const savePromises = this.paymentLines.map(line => {
    const paymentData: NewCustomerPayments = {
      id: null,
      amount: line.amount,
      invoiceCode: this.extractInvoiceNumber(line.description),
      description: line.description,
      date: dayjs(line.date),
      opsUnitID: 'DEFAULT_OPS_UNIT',
      paymentCode: this.generatePaymentCode(),
      serialNo: line.serial,
      lmu: 'system',
      lmd: dayjs(new Date()),
      paymentId: null,
      address: null,
      email: null,
      contactNo: null,
      subTotal: null,
      owing: null,
      discount: null,
      accountInv: null
    };

    return this.customerPaymentsService.create(paymentData).toPromise();
  });

  // Save all payments to backend
  Promise.all(savePromises)
    .then(responses => {
      console.log('All payments saved successfully:', responses);
      this.isSaving = false;

      // Update invoices based on payments made
      const updatedInvoices = this.selectedInvoices.map(inv => {
        const paymentAmount = inv.enteredAmount || 0;
        const currentDueAmount = inv.totalNetAmount || 0; // This is now the due amount
        const newDueAmount = Math.max(0, currentDueAmount - paymentAmount);
        const isFullyPaid = newDueAmount === 0;
        
        return {
          ...inv,
          totalNetAmount: newDueAmount, // Update the due amount
          invoiceStatus: isFullyPaid ? 'PAID' : 'UNPAID'
        };
      });

      // Update backend invoices too
      const updatePromises = updatedInvoices.map(inv =>
        this.invoiceService.partialUpdate({
          id: inv.id,
          totalNetAmount: inv.totalNetAmount, // This now represents due amount
          invoiceStatus: inv.invoiceStatus
        }).toPromise()
      );

      Promise.all(updatePromises)
        .then(() => {
          console.log('All invoices updated in backend.');
          localStorage.setItem('updatedInvoices', JSON.stringify(updatedInvoices));
          this.paymentTransferService.setPayments(this.paymentLines, this.totalSettlementValue);
          this.openReceiptDialog();
        })
        .catch(err => {
          console.error('Failed to update invoices:', err);
          alert('Some invoices failed to update in the backend.');
        });
    })
    .catch(error => {
      console.error('Error saving payments:', error);
      this.isSaving = false;
      alert('Error saving payments. Please try again.');
      
      this.proceedToReceiptCreation();
    });
}

  private extractInvoiceNumber(description: string): string {
    const match = description.match(/Invoice: (\S+)/);
    return match ? match[1] : 'UNKNOWN';
  }

  private openReceiptDialog(): void {
    // Store in shared service for receipt creation
    this.paymentTransferService.setPayments(this.paymentLines, this.totalSettlementValue);

    // Close current AddPayments dialog
    this._dialogRef.close({ success: true });

    // Open ReceiptCreateComponent dialog
    this.dialog.open(ReceiptCreateComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: { 
        supplier: this.data?.supplier || null,
        invoices: this.selectedInvoices 
      },
    });
  }

  private generatePaymentCode(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `PAY-${timestamp}-${random}`;
  }

  private proceedToReceiptCreation(): void {
    // Store in shared service for receipt creation
    this.paymentTransferService.setPayments(this.paymentLines, this.totalSettlementValue);

    // Close current AddPayments dialog
    this._dialogRef.close({ success: true });

    // Open ReceiptCreateComponent dialog
    this.dialog.open(ReceiptCreateComponent, {
      width: '90%',
      maxWidth: '1000px',
      data: { 
        supplier: this.data?.supplier || null,
        invoices: this.selectedInvoices 
      },
    });
  }

  onCancel(): void {
    // Clear payment data when explicitly cancelled
    this.paymentTransferService.clearPayments();
    this._dialogRef.close(false);
  }
}