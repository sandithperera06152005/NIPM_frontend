import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { Observable, map, startWith } from 'rxjs';

import { BankAccountService } from 'app/entities/financemicro/bank-account/service/bank-account.service';
import { IBankAccount, NewBankAccount } from 'app/entities/financemicro/bank-account/bank-account.model';
import { BankDetailsService } from 'app/entities/financemicro/bank-details/service/bank-details.service';
import { IBankDetails } from 'app/entities/financemicro/bank-details/bank-details.model';

import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import dayjs from 'dayjs/esm';

interface IBankOption {
  bankId: number;
  bankName: string;
}

@Component({
  selector: 'app-bank-create-account',
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
    MatAutocompleteModule
  ],
  templateUrl: './bank-create-account.component.html',
  styleUrls: ['./bank-create-account.component.scss']
})
export class BankCreateAccountComponent implements OnInit {

  dialogRef = inject(MatDialogRef<BankCreateAccountComponent>);
  fb = inject(FormBuilder);
  bankService = inject(BankAccountService);
  bankDetailsService = inject(BankDetailsService);
  private accountsService = inject(AccountsService);
  private accountTypeService = inject(AccountTypeService);


  activeTabIndex = 0;

  accountForm!: FormGroup;

  bankControl = new FormControl<IBankOption | string>('');
  filteredBanks!: Observable<IBankOption[]>;

  branchControl = new FormControl('');
  filteredBranches!: Observable<string[]>;

  // Store all bank details from database
  allBankDetails: IBankDetails[] = [];
  
  // Store unique banks
  bankList: IBankOption[] = [];

  accountTypeList = [
    { id: 1, name: 'Savings Account' },
    { id: 2, name: 'Current Account' }
  ];

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      accountNumber: ['', Validators.required],
      accountName: ['', Validators.required],
      bankId: [null, Validators.required],
      bankName: ['', Validators.required],
      branchName: [''],
      branchId: [null],
      amount: [0],
      accountCode: [''],
      accountType: ['', Validators.required]
    });

    this.loadBankDetails();
  }

  loadBankDetails(): void {
    this.bankDetailsService.query({ size: 10000 }).subscribe({
      next: res => {
        this.allBankDetails = res.body || [];
        
        console.log('All bank details loaded:', this.allBankDetails);

        // Create unique bank list from the bank_id column
        const bankMap = new Map<number, IBankOption>();
        
        this.allBankDetails.forEach(detail => {
          if (detail.bankId && detail.bankName) {
            bankMap.set(detail.bankId, {
              bankId: detail.bankId,
              bankName: detail.bankName
            });
          }
        });
        
        this.bankList = Array.from(bankMap.values());
        console.log('Unique banks:', this.bankList);

        // Setup filteredBanks observable
        this.filteredBanks = this.bankControl.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value?.bankName ?? '')),
          map(name => (name ? this.filterBanks(name) : this.bankList.slice()))
        );

        // Setup filteredBranches observable
        this.filteredBranches = this.branchControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterBranches(value || ''))
        );
      },
      error: err => console.error('Error loading bank details', err)
    });
  }

  filterBanks(name: string): IBankOption[] {
    const filterValue = name.toLowerCase();
    return this.bankList.filter(b => b.bankName.toLowerCase().includes(filterValue));
  }

  filterBranches(value: string): string[] {
    const filterValue = value.toLowerCase();
    const selectedBank = this.bankControl.value as IBankOption;
    
    // If no bank is selected or bank is invalid, return empty array
    if (!selectedBank || typeof selectedBank === 'string') {
      return [];
    }

    console.log('Selected Bank ID:', selectedBank.bankId);
    
    // Find all branches where branch_id equals the selected bank's bankId
    // AND branchName is not empty/null
    const branchesForBank = this.allBankDetails
      .filter(bankDetail => {
        // Check if this record has a branchName and its branch_id matches the selected bank's bankId
        const hasBranchName = !!bankDetail.branchName;
        const matchesBankId = bankDetail.branchId === selectedBank.bankId;
        
        console.log(`Checking: ${bankDetail.bankName} - ${bankDetail.branchName}, branchId: ${bankDetail.branchId}, matches: ${matchesBankId}`);
        
        return hasBranchName && matchesBankId;
      })
      .map(bankDetail => bankDetail.branchName!)
      .filter((branchName): branchName is string => !!branchName); // Type guard to ensure non-null

    console.log('Found branches:', branchesForBank);

    // Remove duplicates (in case there are duplicate branch entries)
    const uniqueBranches = [...new Set(branchesForBank)];
    
    console.log('Unique branches:', uniqueBranches);
    
    // Filter by search input
    return uniqueBranches.filter(branch =>
      branch.toLowerCase().includes(filterValue)
    );
  }

  displayBank(bank: IBankOption | string | null): string {
    return typeof bank === 'string' ? bank : bank?.bankName ?? '';
  }

  onBankSelected(bank: IBankOption): void {
    console.log('Bank selected:', bank);
    
    this.accountForm.patchValue({
      bankId: bank.bankId,
      bankName: bank.bankName
    });

    // Clear branch selection when bank changes
    this.branchControl.setValue('');
    this.accountForm.patchValue({
      branchName: '',
      branchId: null
    });

    // Trigger branch filter update
    this.branchControl.updateValueAndValidity();
  }

  onBankBlur(): void {
    const value = this.bankControl.value;
    if (typeof value === 'string') {
      const foundBank = this.bankList.find(
        bank => bank.bankName.toLowerCase() === value.toLowerCase()
      );
      if (foundBank) {
        this.bankControl.setValue(foundBank);
        this.onBankSelected(foundBank);
      } else {
        // If no exact match, clear the selection
        this.bankControl.setValue('');
        this.accountForm.patchValue({
          bankId: null,
          bankName: ''
        });
      }
    }
  }

  onBranchSelected(branch: string): void {
    const selectedBank = this.bankControl.value as IBankOption;
    
    this.accountForm.patchValue({
      branchName: branch
    });

    // Find the complete branch details including branchId
    if (selectedBank && branch) {
      const branchDetail = this.allBankDetails.find(
        detail => detail.branchName === branch && 
                 detail.branchId === selectedBank.bankId
      );
      
      if (branchDetail) {
        console.log('Branch detail found:', branchDetail);
        // If you need to store the actual record ID, you can use detail.id
        this.accountForm.patchValue({
          branchId: branchDetail.id
        });
      }
    }
  }

  submit(): void {
    const bank = this.bankControl.value as IBankOption;

    this.accountForm.patchValue({
      bankId: bank?.bankId ?? null,
      bankName: bank?.bankName ?? ''
    });

    // extract accountType to store inside LMU
    const { accountType, ...formValue } = this.accountForm.value;

    const payload: NewBankAccount = {
      id: null,
      companyId: null,
      ...formValue,
      lmd: null,
      lmu: accountType,   // <-- STORE HERE
      isActive: true
    };

    this.bankService.create(payload).subscribe({
      next: () => {
        // Create account entry for the bank
        const accountName = this.accountForm.get('accountName')?.value;
        const amount = this.accountForm.get('amount')?.value || 0;

        const accountTypePath = `Asset/Current Asset/Bank Account/${accountName}`.replace(/\/+/g, '/');

        this.createBankAccountEntry(accountName, amount, accountTypePath);
        this.createBankAccountType(accountTypePath);
        
        this.dialogRef.close(true);
      },
      error: err => console.error('Error creating bank account:', err)
    });
  }

  getAccountTypeName(name: string): string {
    return this.accountTypeList.find(t => t.name === name)?.name ?? '';
  }

  close(): void {
    this.dialogRef.close(false);
  }

  private createBankAccountEntry(accountName: string, creditAmount: number, path: string): void {
    //const accountName = bankName;
    
    // Check if bank account already exists
    const params = {
      'name.equals': accountName
    };

    this.accountsService.query(params).subscribe({
      next: (response) => {
        const existingAccounts = response.body || [];
        
        if (existingAccounts.length > 0) {
          // Update existing bank account - ADD to CREDIT column
          this.updateExistingBankAccount(existingAccounts[0], creditAmount, accountName, path);
        } else {
          // Create new bank account
          this.createNewBankAccount(accountName, creditAmount, path);
        }
      },
      error: (error) => {
        console.error('Error checking existing bank accounts:', error);
        this.createNewBankAccount(accountName, creditAmount, path);
      }
    });
  }

  private createBankAccountType(fullPath: string): void {
  if (!fullPath) {
    return;
  }

  const queryParams = {
    'lmu.equals': fullPath
  };

  this.accountTypeService.query(queryParams).subscribe({
    next: response => {
      const existing = response.body || [];

      if (existing.length > 0) {
        console.log('Account Type already exists:', fullPath);
        return;
      }

      const payload = {
        id: null,
        type: 'Asset',
        lmu: fullPath,
        code: this.generateBankSubCode()
      };

      this.accountTypeService.create(payload).subscribe({
        next: () => console.log('Account Type created:', fullPath),
        error: err => console.error('Error creating Account Type:', err)
      });
    }
  });
}

private generateBankSubCode(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AS-BNK-${rand}`;
}

  private updateExistingBankAccount(existingAccount: any, creditAmount: number, bankName: string, path: string): void {
    const existingCredit = Number(existingAccount.creditAmount) || 0;
    const existingAmount = Number(existingAccount.amount) || 0;
    const addAmount = Number(creditAmount) || 0;

    const newCreditAmount = existingCredit + addAmount;
    const newTotalAmount = existingAmount + addAmount;

    const updatedAccount = {
      ...existingAccount,
      creditAmount: newCreditAmount,
      amount: newTotalAmount,
      path: path,
      date: dayjs(new Date())
    };

    this.accountsService.update(updatedAccount).subscribe({
      next: response => {
        console.log(`Bank account for ${bankName} updated successfully.`);
      },
      error: error => {
        console.error(`Error updating bank account for ${bankName}:`, error);
      }
    });
  }

  private createNewBankAccount(bankName: string, creditAmount: number, path: string): void {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const accountCode = `BNK${randomNum}`;

    const accountData: any = {
      code: accountCode,
      name: bankName,
      parent: 'Asset',
      date: dayjs(new Date()),
      child: bankName,
      amount: creditAmount,
      creditAmount: creditAmount,
      debitAmount: null,
      path: path
    };

    this.accountsService.create(accountData).subscribe({
      next: (response) => {
        console.log(`New bank account created for ${bankName}:`, response);
      },
      error: (error) => {
        console.error(`Error creating bank account for ${bankName}:`, error);
      }
    });
  }
  
}