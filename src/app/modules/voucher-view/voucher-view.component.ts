import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VoucherService } from 'app/entities/financemicro/voucher/service/voucher.service';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service'; // Add this import
import { forkJoin } from 'rxjs'; // Add this import

@Component({
  selector: 'app-voucher-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
  ],
  templateUrl: './voucher-view.component.html',
  styleUrls: ['./voucher-view.component.scss'],
})
export class VoucherViewComponent implements OnInit {
  voucher: any = null;
  invoiceLines: any[] = [];
  paymentLines: any[] = []; 


  constructor(
    public dialogRef: MatDialogRef<VoucherViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private accountTypeService: AccountTypeService // Inject account service
  ) {}

  ngOnInit(): void {
    const id = this.data.id;
    this.voucherService.find(id).subscribe({
      next: (res) => {
        this.voucher = res.body ?? res;
        if (this.voucher?.code) {
          this.voucherService.query({ 'code.equals': this.voucher.code }).subscribe({
            next: (res2) => {
              this.invoiceLines = res2.body ?? [];
              this.extractPaymentLines();

              if (this.paymentLines.length === 0){
                this.loadAccountDetails(); 
              }
            },
            error: (err) => console.error('Error fetching related invoice lines:', err),
          });
        }
      },
      error: (err) => console.error('Error fetching receipt:', err),
    });
  }

    // Extract payment lines from comments
  extractPaymentLines(): void {
    this.paymentLines = [];
    
    this.invoiceLines.forEach((line, index) => {
      // Check if the comment contains payment information pattern
      if (line.comments && line.comments.includes('Invoice:')) {
        this.paymentLines.push({
          serial: index + 1,
          description: line.comments,
          amount: line.amount
        });
      }
    });
  }

  // Load full account details for all lines
  loadAccountDetails(): void {
    const accountRequests: any[] = [];

    // Collect all unique account IDs
    this.invoiceLines.forEach(line => {
      if (line.parentAccount?.id) {
        accountRequests.push(this.accountTypeService.find(line.parentAccount.id));
      }
      if (line.subAccount?.id) {
        accountRequests.push(this.accountTypeService.find(line.subAccount.id));
      }
    });

    if (accountRequests.length === 0) {
      return;
    }

    // Fetch all account details
    forkJoin(accountRequests).subscribe({
      next: (accountResponses: any[]) => {
        const accountsMap = new Map();
        
        // Store accounts in a map by ID
        accountResponses.forEach(response => {
          const account = response.body || response;
          accountsMap.set(account.id, account);
        });

        // Update invoice lines with full account data
        this.invoiceLines = this.invoiceLines.map(line => ({
          ...line,
          parentAccount: line.parentAccount?.id ? accountsMap.get(line.parentAccount.id) : line.parentAccount,
          subAccount: line.subAccount?.id ? accountsMap.get(line.subAccount.id) : line.subAccount
        }));

        console.log('Updated invoice lines with full account data:', this.invoiceLines);
      },
      error: (err) => console.error('Error fetching account details:', err)
    });
  }

  // Get first segment of LMU path
  getFirstSegment(account: any): string {
    if (!account) return 'N/A';
    
    if (account.lmu) {
      const segments = account.lmu.split('/');
      return segments[0] || account.type || account.code || 'Unknown';
    }
    
    return account.type || account.code || 'No LMU';
  }

  // Get last segment of LMU path
  getLastSegment(account: any): string {
    if (!account) return 'N/A';
    
    if (account.lmu) {
      const segments = account.lmu.split('/');
      return segments[segments.length - 1] || account.type || account.code || 'Unknown';
    }
    
    return account.type || account.code || 'No LMU';
  }
}