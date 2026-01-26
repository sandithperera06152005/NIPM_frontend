import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { VoucherCreateComponent } from '../voucher-create/voucher-create.component';
import { PaymentTransferService } from 'app/entities/financemicro/service/payment-transfer.service';
import { VendorPaymentsService } from 'app/entities/financemicro/vendor-payments/service/vendor-payments.service';
import { NewVendorPayments } from 'app/entities/financemicro/vendor-payments/vendor-payments.model';
import dayjs from 'dayjs/esm';
import { GRNService } from 'app/entities/inventorymicro/grn/service/grn.service';


@Component({
  selector: 'app-vendor-Addpayments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './vendor-Addpayments.component.html',
  styleUrls: ['./vendor-Addpayments.component.scss']
})
export class VendorAddPaymentsComponent implements OnInit {
  paymentForm: FormGroup;
  selectedGRNs: any[] = [];
  totalEnteredAmount = 0;
  totalOwingAmount = 0;
  paymentLines: { serial: number; description: string; amount: number; date: Date }[] = [];
  totalSettlementValue = 0;
  isSaving = false;
  

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<VendorAddPaymentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private paymentTransferService: PaymentTransferService,
    private vendorPaymentsService: VendorPaymentsService,
    private grnService: GRNService,
    

  ) {
    this.selectedGRNs = data.grns || [];

    this.totalEnteredAmount = this.selectedGRNs.reduce((sum, grn) => sum + (grn.enteredAmount || 0), 0);
    this.totalOwingAmount = this.selectedGRNs.reduce((sum, grn) => sum + (grn.amountOwing || 0), 0);

    this.paymentForm = this._fb.group({});
  }

  ngOnInit(): void {}

  /** Create summary lines */
  onSubmit(): void {
    this.paymentLines = [];
    let serial = 1;

    this.selectedGRNs.forEach(grn => {
      if (grn.enteredAmount && grn.enteredAmount > 0) {
        this.paymentLines.push({
          serial: serial++,
          description: `GRN: ${grn.grnCode} - ${grn.supplierName}`,
          amount: grn.enteredAmount,
          date: new Date(),
        });
      }
    });

    this.totalSettlementValue = this.paymentLines.reduce((sum, line) => sum + line.amount, 0);
  }

  onCancel(): void {
    this._dialogRef.close(false);
  }

  
onSavePayments(): void {
  if (this.paymentLines.length === 0) {
    alert('No payment lines to save.');
    return;
  }

  this.isSaving = true;

  const savePromises = this.paymentLines.map(line => {
    const paymentData: NewVendorPayments = {
      id: null,
      amount: line.amount,
      grnCode: this.extractGRNCode(line.description),
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
      accountInv: null,
    };

    return this.vendorPaymentsService.create(paymentData).toPromise();
  });

  Promise.all(savePromises)
    .then(async responses => {
      console.log('✅ All vendor payments saved successfully:', responses);
      this.isSaving = false;

      // mark related GRNs as paid
      await this.markSelectedGRNsAsPaid();

      // store payments in transfer service
      this.paymentTransferService.setPayments(this.paymentLines, this.totalSettlementValue);

      // close AddPayments dialog
      this._dialogRef.close({ success: true });
      this._dialogRef.close({ success: true, refresh: true });

      // open VoucherCreate dialog
      this.dialog.open(VoucherCreateComponent, {
        width: '90%',
        maxWidth: '1000px',
        data: {
          supplier: this.data?.supplier || null,
          grns: this.selectedGRNs,
        },
      });
    })
    .catch(error => {
      console.error('Error saving vendor payments:', error);
      this.isSaving = false;
      this.proceedToVoucherCreation();
    });
}

private async markSelectedGRNsAsPaid(): Promise<void> {
  const markPromises = this.selectedGRNs.map(grn => {
    if (grn.enteredAmount > 0) {
      // Calculate the new owing amount after payment
      const newOwing = grn.amountOwing - grn.enteredAmount;

      // Case 1: Fully paid
      if (newOwing <= 0) {
        return this.grnService
          .partialUpdate({
            id: grn.id,
            inspected: true, // mark as paid
            amountOwing: 0,  // clear balance
          })
          .toPromise()
          .then(() => console.log(`✅ GRN ${grn.grnCode} fully settled.`))
          .catch(err => console.error(`Error marking GRN ${grn.grnCode} as paid:`, err));
      }

      // Case 2: Partially paid
      else {
        return this.grnService
          .partialUpdate({
            id: grn.id,
            amountOwing: newOwing, // update remaining balance
          })
          .toPromise()
          .then(() =>
            console.log(
              `🟡 GRN ${grn.grnCode} partially paid. Remaining balance: ${newOwing}`
            )
          )
          .catch(err => console.error(`Error updating GRN ${grn.grnCode}:`, err));
      }
    }

    // No payment entered for this GRN → do nothing
    return Promise.resolve();
  });

  await Promise.all(markPromises);
}



private extractGRNCode(description: string): string {
  const match = description.match(/GRN: (\S+)/);
  return match ? match[1] : 'UNKNOWN';
}

private generatePaymentCode(): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `VENDORPAY-${timestamp}-${random}`;
}

private proceedToVoucherCreation(): void {
  this.paymentTransferService.setPayments(this.paymentLines, this.totalSettlementValue);
  this._dialogRef.close({ success: true });
  this.dialog.open(VoucherCreateComponent, {
    width: '90%',
    maxWidth: '1000px',
    data: { 
      supplier: this.data?.supplier || null,
      grns: this.selectedGRNs 
    },
  });
}


}
