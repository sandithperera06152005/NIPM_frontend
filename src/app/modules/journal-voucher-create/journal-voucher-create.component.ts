import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable, map, startWith } from 'rxjs';
import dayjs from 'dayjs/esm';

import { JournalVoucherService } from 'app/entities/financemicro/journal-voucher/service/journal-voucher.service';
import { IJournalVoucher, NewJournalVoucher } from 'app/entities/financemicro/journal-voucher/journal-voucher.model';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { IAccountType } from 'app/entities/financemicro/account-type/account-type.model';
import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';

@Component({
  selector: 'app-journal-voucher-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './journal-voucher-create.component.html',
  styleUrls: ['./journal-voucher-create.component.scss']
})
export class JournalVoucherCreateComponent implements OnInit {
  
  private _dialogRef = inject(MatDialogRef<JournalVoucherCreateComponent>);
  private _fb = inject(FormBuilder);
  private _journalVoucherService = inject(JournalVoucherService);
  private _accountTypeService = inject(AccountTypeService);
  private _snackBar = inject(MatSnackBar);
  private _accountsService = inject(AccountsService);


 // private currentVoucherNumber = 1;

  
  voucherForm!: FormGroup;
  activeTabIndex = 0;
  
  // Account Types
  accountTypes: IAccountType[] = [];
  filteredAccountTypes!: Observable<IAccountType[]>;
  accountTypeControl = new FormControl<string | IAccountType>('');
  
  // Journal Entries
  journalEntries: FormArray;
  displayedColumns: string[] = ['serialNo', 'accountCode', 'debit', 'credit', 'comments', 'actions'];
  voucherCode: string = '';
  
  constructor() {
    // Initialize FormArray for journal entries
    this.journalEntries = this._fb.array([]);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccountTypes();
    this.setupFiltering();
    this.generateVoucherCode();
  }

  // Generate voucher code: JV1, JV2, etc.
  private generateVoucherCode(): void {
  this._journalVoucherService.query({
    size: 10000,   // get all vouchers
  }).subscribe({
    next: res => {
      let maxNumber = 0;

      if (res.body && res.body.length > 0) {
        res.body.forEach(voucher => {
          if (voucher.code && voucher.code.startsWith('JV')) {
            const num = parseInt(voucher.code.replace('JV', ''), 10);
            if (!isNaN(num) && num > maxNumber) {
              maxNumber = num;
            }
          }
        });
      }

      const nextNumber = maxNumber + 1;
      this.voucherCode = `JV${nextNumber}`;

      this.voucherForm.patchValue({ code: this.voucherCode });

      console.log('✅ Generated voucher code:', this.voucherCode);
    },
    error: err => {
      console.error('❌ Failed to generate voucher code:', err);

      // Emergency fallback (never duplicates)
      this.voucherCode = `JV${Date.now()}`;
      this.voucherForm.patchValue({ code: this.voucherCode });
    }
  });
}




  private initializeForm(): void {
    this.voucherForm = this._fb.group({
      code: ['', Validators.required], // Start with empty, will be populated async
      date: [dayjs(), Validators.required],
      comments: [''],
      // Line item form - make these NOT required
      subAccount: [null],
      transactionType: ['debit'],
      amount: [null],
      lineComments: [''],
      // Totals (readonly)
      debitTotal: [{ value: 0, disabled: true }],
      creditTotal: [{ value: 0, disabled: true }]
    });

    // Add entries array to form
    this.voucherForm.addControl('entries', this.journalEntries);
  }

  private loadAccountTypes(): void {
    this._accountTypeService.query({ size: 1000 }).subscribe({
      next: (res) => {
        this.accountTypes = res.body || [];
        console.log('Account types loaded:', this.accountTypes.length);
      },
      error: (err) => {
        console.error('Error loading account types:', err);
        this._snackBar.open('Failed to load account types', 'Close', { duration: 3000 });
      }
    });
  }

  private setupFiltering(): void {
    this.filteredAccountTypes = this.accountTypeControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.type || '';
        return name ? this.filterAccountTypes(name) : this.accountTypes.slice();
      })
    );
  }

  private filterAccountTypes(name: string): IAccountType[] {
    const filterValue = name.toLowerCase();
    return this.accountTypes.filter(accountType =>
      accountType.type?.toLowerCase().includes(filterValue) ||
      accountType.code?.toLowerCase().includes(filterValue) ||
      accountType.lmu?.toLowerCase().includes(filterValue)
    );
  }

  // Display function for autocomplete
  displayAccountType(accountType: IAccountType | string): string {
    if (typeof accountType === 'string') {
      return accountType;
    }
    return accountType ? `${accountType.code} - ${accountType.type}` : '';
  }

  onAccountTypeSelected(selectedAccount: IAccountType): void {
    this.voucherForm.patchValue({
      subAccount: selectedAccount
    });
  }

  // Add a new journal entry line
  addJournalEntry(): void {
    const lineData = this.voucherForm.value;
    
    if (!lineData.subAccount || !lineData.amount) {
      this._snackBar.open('Please select an account and enter an amount', 'Close', { duration: 3000 });
      return;
    }

    const serialNo = this.journalEntries.length + 1;
    const transactionType = lineData.transactionType;
    const amount = parseFloat(lineData.amount);
    
    const entryGroup = this._fb.group({
      serialNo: [serialNo],
      accountType: [lineData.subAccount],
      accountCode: [lineData.subAccount.code],
      debit: [transactionType === 'debit' ? amount : 0],
      credit: [transactionType === 'credit' ? amount : 0],
      comments: [lineData.lineComments || '']
    });

    this.journalEntries.push(entryGroup);
    
    // Reset the line form
    this.voucherForm.patchValue({
      subAccount: null,
      amount: null,
      lineComments: '',
      transactionType: 'debit'
    });
    this.accountTypeControl.setValue('');
    
    // Update totals
    this.updateTotals();
    
    this._snackBar.open('Entry added successfully', 'Close', { duration: 2000 });
  }

  // Remove a journal entry
  removeJournalEntry(index: number): void {
    this.journalEntries.removeAt(index);
    
    // Recalculate serial numbers
    this.recalculateSerialNumbers();
    
    // Update totals
    this.updateTotals();
  }

  // Recalculate serial numbers after removal
  private recalculateSerialNumbers(): void {
    this.journalEntries.controls.forEach((control, index) => {
      control.patchValue({
        serialNo: index + 1
      });
    });
  }

  // Update debit and credit totals
  private updateTotals(): void {
    let debitTotal = 0;
    let creditTotal = 0;

    this.journalEntries.controls.forEach(control => {
      debitTotal += control.get('debit')?.value || 0;
      creditTotal += control.get('credit')?.value || 0;
    });

    this.voucherForm.patchValue({
      debitTotal: debitTotal.toFixed(2),
      creditTotal: creditTotal.toFixed(2)
    });
  }

  // Get table data for display
  get tableData(): any[] {
    return this.journalEntries.controls.map(control => control.value);
  }

  // Get total debit
  get totalDebit(): number {
    return this.tableData.reduce((sum, item) => sum + (item.debit || 0), 0);
  }

  // Get total credit
  get totalCredit(): number {
    return this.tableData.reduce((sum, item) => sum + (item.credit || 0), 0);
  }

  // Validate that debit equals credit
  validateJournalEntry(): boolean {
    // const debitTotal = this.totalDebit;
    // const creditTotal = this.totalCredit;
    
    // if (debitTotal !== creditTotal) {
    //   this._snackBar.open(`Debit total (${debitTotal}) does not equal Credit total (${creditTotal})`, 'Close', { duration: 4000 });
    //   return false;
    // }
    
    if (this.journalEntries.length === 0) {
      this._snackBar.open('Please add at least one journal entry', 'Close', { duration: 3000 });
      return false;
    }
    
    return true;
  }

  // Save journal voucher
  saveJournalVoucher(): void {
  if (!this.validateJournalEntry()) return;

  const formData = this.voucherForm.getRawValue();

  if (!formData.code) {
    this._snackBar.open('Voucher code not ready', 'Close', { duration: 3000 });
    return;
  }

  const newVoucher: NewJournalVoucher = {
    id: null,
    code: formData.code,
    date: formData.date,
    debitTotal: this.totalDebit,
    creditTotal: this.totalCredit,
    comments: formData.comments,
    value: this.totalDebit,
    serialNo: this.journalEntries.length
  };

  this._journalVoucherService.create(newVoucher).subscribe({
    next: (response) => {
      this.createAccountEntries(formData.code, response.body);

      this._snackBar.open('Journal voucher saved successfully', 'Close', { duration: 3000 });
      this._dialogRef.close({ created: true, voucherCode: formData.code });
    },
    error: error => {
      console.error('Error saving journal voucher:', error);
      this._snackBar.open('Failed to save journal voucher', 'Close', { duration: 3000 });
    }
  });
}

private createAccountEntries(voucherCode: string, journalVoucher: any): void {
  this.tableData.forEach((entry, index) => {
    const accountData: any = {
      code: voucherCode,  // JV1, JV2, etc.
      name: `Journal Voucher - ${voucherCode} - Line ${index + 1}`,
      date: this.voucherForm.get('date')?.value,
      parent: this.getParentFromPath(entry.accountType?.lmu),
      child: entry.accountType?.lmu?.split('/').pop() || '',
      path: entry.accountType?.lmu || '',
      creditAmount: entry.credit,
      debitAmount: entry.debit,
      amount: entry.debit + entry.credit,
      //comments: entry.comments 
    };
    
    // First check if account entry already exists
    this._accountsService.query({
      'code.equals': voucherCode,
      'path.equals': entry.accountType?.lmu,
      size: 1
    }).subscribe({
      next: (res) => {
        if (res.body && res.body.length > 0) {
          // Update existing entry
          const existingAccount = res.body[0];
          const updatedAccount = {
            ...existingAccount,
            creditAmount: (existingAccount.creditAmount || 0) + accountData.creditAmount,
            debitAmount: (existingAccount.debitAmount || 0) + accountData.debitAmount,
            amount: (existingAccount.amount || 0) + accountData.amount
          };
          
          this._accountsService.update(updatedAccount).subscribe({
            next: () => console.log(`Updated account entry for ${voucherCode}`),
            error: (err) => console.error('Error updating account:', err)
          });
        } else {
          // Create new account entry
          this._accountsService.create(accountData).subscribe({
            next: () => console.log(`Created account entry for ${voucherCode}`),
            error: (err) => console.error('Error creating account:', err)
          });
        }
      },
      error: (err) => {
        console.error('Error checking existing accounts:', err);
      }
    });
  });
}

// Helper method to extract parent from path
private getParentFromPath(path: string): string {
  if (!path) return '';
  
  const parts = path.split('/');
  if (parts.length > 1) {
    return parts[parts.length - 2]; // Second last part
  }
  return parts[0] || '';
}

  
  // Close dialog
  close(): void {
    this._dialogRef.close(false);
  }
}