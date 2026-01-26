import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { Observable, forkJoin, startWith, map } from 'rxjs';
import dayjs from 'dayjs/esm';

import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { InventoryService } from 'app/entities/inventorymicro/inventory/service/inventory.service';
import { BankDetailsService } from 'app/entities/financemicro/bank-details/service/bank-details.service';
import { BankDetailsFormService } from 'app/entities/financemicro/bank-details/update/bank-details-form.service';
import { PaymentTransferService } from 'app/entities/financemicro/service/payment-transfer.service';

import { IVoucher, NewVoucher } from 'app/entities/financemicro/voucher/voucher.model';
import { VoucherService } from 'app/entities/financemicro/voucher/service/voucher.service';
import { IAccountType } from 'app/entities/financemicro/account-type/account-type.model';
import { IBankDetails } from 'app/entities/financemicro/bank-details/bank-details.model';
import { MatDialogModule } from '@angular/material/dialog';

import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';

import { BankAccountService } from 'app/entities/financemicro/bank-account/service/bank-account.service';
import { IBankAccount } from 'app/entities/financemicro/bank-account/bank-account.model';


@Component({
  selector: 'app-voucher-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatButtonModule,
    MatCheckboxModule, MatRadioModule, MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule, MatDialogModule
  ],
  templateUrl: './voucher-create.component.html',
  styleUrl: './voucher-create.component.scss'
})
export class VoucherCreateComponent implements OnInit {

  addedPayments: any[] = [];
  activeTabIndex = 0;

  inventoryservice = inject(InventoryService);
  categoryService = inject(AccountTypeService);

  invoiceLines: FormArray;
  parentAccount: FormGroup;
  categoryForm: FormGroup;
  invoiceForm: FormGroup;
  categories: IAccountType[] = [];
  filteredCategories!: Observable<IAccountType[]>;

  maxDate = new Date();
  loadVouchers: any;

  editBankForm = this._bankDetailsFormService.createBankDetailsFormGroup();
  bankForm = this._bankDetailsFormService.getBankDetails(this.editBankForm);

  paymentLines: any[] = [];
  totalSettlementValue: number = 0;

  bankAccounts: IBankAccount[] = [];
  bankAccountControl = new FormControl<IBankAccount | null>(null);
  filteredBankAccounts!: Observable<IBankAccount[]>;

  bankList: IBankDetails[] = [];
  branchList: string[] = [];
  depositBankControl = new FormControl<IBankDetails | null>(null);
  filteredDepositBanks!: Observable<IBankDetails[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<VoucherCreateComponent>,
    public _snackBarService: MatSnackBar,
    private voucherService: VoucherService,
    private _bankDetailsService: BankDetailsService,
    private _bankDetailsFormService: BankDetailsFormService,
    private paymentTransferService: PaymentTransferService,
    private accountsService: AccountsService,
    private bankAccountService: BankAccountService,

    @Inject(MAT_DIALOG_DATA) public data: { supplier: any }
  ) {
    this.invoiceLines = this.fb.array([this.createInvoiceLine()]);
    this.invoiceForm = this.fb.group({
      lines: this.invoiceLines
    });

    this.categoryForm = this.fb.group({
      paymentMethod: [''],
      voucherNumber: [''],
      voucherDate: [new Date(), Validators.required],
      amount: ['', Validators.required],
      amountPaying: ['', Validators.required],
      amountPayingWords: [''],

      checkDate: [''],
      checkNo: [''],
      amountNo: [''],

      branch: [''],
      refNo: [''],
      depBank: [''],
      depAmount: [''],
    });

    // clear payment data on close
    this.dialogRef.afterClosed().subscribe(() => {
      if (this.paymentLines.length > 0) this.paymentTransferService.clearPayments();
    });
  }

  ngOnInit(): void {
    this.getAllBankAccounts(); // For cheque payments
    this.getAllBanks(); // For deposit payments (keep original method)

    this.paymentLines = this.paymentTransferService.getPayments();
    this.totalSettlementValue = this.paymentTransferService.getTotalSettlementValue();

    if (this.categoryForm) {
      this.categoryForm.patchValue({
        amount: this.totalSettlementValue,
        amountPaying: this.totalSettlementValue,
      });
    }

    this.paymentLines.forEach(line => {
      this.addInvoiceLineWithData(line.description, line.amount);
    });

    // Setup bank account autocomplete for Cheque
    this.filteredBankAccounts = this.bankAccountControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.accountName;
        return name ? this._filterBankAccounts(name as string) : this.bankAccounts.slice();
      })
    );

    // Setup bank autocomplete for Deposit
    this.filteredDepositBanks = this.depositBankControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        // Extract string value from either string or IBankDetails object
        const searchValue = typeof value === 'string' ? value : (value ? value.bankName || '' : '');
        return this._filterBanks(searchValue);
      })
    );

    // Add controls to the form
    this.categoryForm.addControl('selectedBankAccount', this.bankAccountControl); // For cheque
    this.categoryForm.addControl('selectedDepositBank', this.depositBankControl); // For deposit

    this.fetchCategories();

    this.categoryForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      this.generateVoucherNumber();
      this.validateAmountsMatch();

      if (method !== 'Cheque') {
        this.bankAccountControl.reset();
      }
      if (method !== 'Deposit') {
        this.depositBankControl.reset();
        this.categoryForm.get('branch')?.reset();
      }
    });

    this.categoryForm.get('amountPaying')?.valueChanges.subscribe(value => {
      if (value && !isNaN(value)) {
        const words = this.numberToWords(Number(value));
        this.categoryForm.get('amountPayingWords')?.setValue(words + ' Only', { emitEvent: false });
      } else {
        this.categoryForm.get('amountPayingWords')?.setValue('', { emitEvent: false });
      }
    });

    this.invoiceLines.valueChanges.subscribe(() => this.validateAmountsMatch());

    this.dialogRef.afterClosed().subscribe(() => {
      this.paymentTransferService.clearPayments();
    });
  }

  getAllBanks(): void {
    this._bankDetailsService.query({ page: 0, size: 2000 }).subscribe(res => {
      this.bankList = res.body;
      this.branchList = Array.from(new Set(this.bankList.map(b => b.branchName).filter(b => !!b)));
    });
  }

  private _filterBanks(value: string): IBankDetails[] {
    const filterValue = value.toLowerCase();
    return this.bankList.filter(bank =>
      bank.bankName?.toLowerCase().includes(filterValue)
    );
  }

  displayBank(bank: IBankDetails): string {
    return bank && bank.bankName ? bank.bankName : '';
  }

  // New: Get all bank accounts
  getAllBankAccounts(): void {
    this.bankAccountService.query({ page: 0, size: 2000 }).subscribe({
      next: (res) => {
        this.bankAccounts = res.body || [];
        console.log('Loaded bank accounts:', this.bankAccounts);
      },
      error: (err) => {
        console.error('Failed to load bank accounts:', err);
        this._snackBarService.open('Failed to load bank accounts', 'Close', { duration: 3000 });
      }
    });
  }

  // New: Filter bank accounts by account name
  private _filterBankAccounts(value: string): IBankAccount[] {
    const filterValue = value.toLowerCase();
    return this.bankAccounts.filter(account =>
      account.accountName?.toLowerCase().includes(filterValue) ||
      account.accountNumber?.toLowerCase().includes(filterValue) ||
      account.bankName?.toLowerCase().includes(filterValue)
    );
  }

  // New: Display function for autocomplete
  displayBankAccount(account: IBankAccount | null): string {
    if (!account) return '';
    return account.accountName || '';
  }


  // ----------------- LINE METHODS -------------------
  createInvoiceLine(): FormGroup {
    return this.fb.group({
      subAccount: [null, Validators.required],
      parentAccount: [null, Validators.required],
      comments: [''],
      lineAmount: ['', Validators.required]
    });
  }

  addInvoiceLineWithData(description: string, amount: number): void {
    const lineGroup = this.fb.group({
      subAccount: [null],
      parentAccount: [null],
      comments: [description],
      lineAmount: [amount, Validators.required]
    });
    this.invoiceLines.push(lineGroup);
  }

  removeLine(index: number): void {
    this.invoiceLines.removeAt(index);
  }

  get amountPaying(): number {
    return parseFloat(this.categoryForm.get('amountPaying')?.value) || 0;
  }

  // ----------------- ACCOUNT METHODS -------------------

  fetchCategories(): void {
    this.categoryService.query({ size: 1001 }).subscribe({
      next: res => this.categories = res.body || [],
      error: err => console.error('Failed to fetch categories', err)
    });
  }

  displaySubAccount(cat: IAccountType | string): string {
    if (typeof cat === 'string') return cat;
    return cat ? cat.lmu?.split('/').pop() ?? '' : '';
  }

  //   displayParentAccount(parent: IAccountType | string): string {
  //     if (!parent) return '';
  //     if (typeof parent === 'string') return parent;
  //   return parent.lmu?.split('/')[0] ?? '';
  // }


  setupFilteringForLine(index: number): Observable<IAccountType[]> {
    const control = (this.invoiceLines.at(index) as FormGroup).get('subAccount') as FormControl;
    return control.valueChanges.pipe(
      startWith(''),
      map(value => {
        let searchTerm = '';
        if (typeof value === 'string') {
          searchTerm = value.toLowerCase();
        } else if (value && typeof value === 'object') {
          searchTerm = value.lmu?.split('/').pop()?.toLowerCase() || '';
        }
        return this.categories.filter(cat =>
          cat.lmu?.split('/').pop()?.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  onSubAccountSelected(selectedSub: IAccountType, index: number): void {
    if (!selectedSub?.lmu) return;

    // Set the selected sub account into the form (full object)
    (this.invoiceLines.at(index) as FormGroup).get('subAccount')?.setValue(selectedSub);

    // Extract parent name (first segment of the lmu path)
    const parentName = selectedSub.lmu.split('/')[0]?.trim();
    if (!parentName) {
      // no parent segment found
      (this.invoiceLines.at(index) as FormGroup).get('parentAccount')?.setValue(null);
      return;
    }

    // Try to find existing parent category in this.categories.
    // We search in a few robust ways to avoid failures due to formatting:
    const parentAccount = this.categories.find(cat => {
      if (!cat?.lmu) return false;
      // if the category is top-level it will typically have no '/' in its lmu
      if (cat.lmu === parentName) return true;
      // if lmu is full path for some reason, compare only first segment
      if (cat.lmu.split('/')[0] === parentName) return true;
      // case-insensitive fallback
      if (cat.lmu.toLowerCase() === parentName.toLowerCase()) return true;
      return false;
    });

    if (parentAccount) {
      // Found a matching top-level account object — assign it
      (this.invoiceLines.at(index) as FormGroup).get('parentAccount')?.setValue(parentAccount);
      console.log(`Auto-selected parent account for line ${index}:`, parentAccount);
    } else {
      // No existing parent object found in categories.
      // Create a minimal fallback object so downstream code still has something useful.
      // Keep the shape small — you can expand to id/code if you prefer.
      const fallbackParent: any = { lmu: parentName };
      (this.invoiceLines.at(index) as FormGroup).get('parentAccount')?.setValue(fallbackParent);
      console.warn(`Parent account "${parentName}" not found in categories — set fallback object for line ${index}.`);
    }
  }

  displayParentAccount(parent: IAccountType | string | null | undefined): string {
    if (!parent) return '';
    if (typeof parent === 'string') return parent;

    return parent.type ?? parent.lmu ?? parent.code ?? '';
  }

  // ----------------- VALIDATION & SAVE -------------------
  numberToWords(num: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
      'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
      'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num || 0) === 0) return 'Zero';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred ' + this.numberToWords(num % 100);
    if (num < 100000) return this.numberToWords(Math.floor(num / 1000)) + ' Thousand ' + this.numberToWords(num % 1000);
    if (num < 10000000) return this.numberToWords(Math.floor(num / 100000)) + ' Lakh ' + this.numberToWords(num % 100000);
    return this.numberToWords(Math.floor(num / 10000000)) + ' Crore ' + this.numberToWords(num % 10000000);
  }

  calculateInvoiceLinesTotal(): number {
    return this.invoiceLines.controls.reduce((acc, ctrl) =>
      acc + (parseFloat(ctrl.get('lineAmount')?.value) || 0), 0);
  }

  validateAmountsMatch(): void {
    const voucherAmount = parseFloat(this.categoryForm.get('amountPaying')?.value) || 0;
    const linesTotal = this.calculateInvoiceLinesTotal();

    if (Math.abs(voucherAmount - linesTotal) > 0.01) {
      this.categoryForm.get('amountPaying')?.setErrors({ amountMismatch: true });
    } else {
      this.categoryForm.get('amountPaying')?.setErrors(null);
    }
  }

  generateVoucherNumber(): void {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const voucherNumber = `VCHR${randomNumber}`;
    this.categoryForm.get('voucherNumber')?.setValue(voucherNumber);
  }

  onStepBack(): void {
    if (this.categoryForm.get('amountPaying')?.hasError('amountMismatch')) {
      this.categoryForm.get('amountPaying')?.setErrors(null);
    }
  }

  onSave(): void {
    this.validateAmountsMatch();
    if (this.categoryForm.get('amountPaying')?.hasError('amountMismatch')) {
      this._snackBarService.open('Amount paying must match line total', 'Close', { duration: 3000 });
      return;
    }

    const categoryData = this.categoryForm.value;
    const invoiceLinesData = this.invoiceLines.value;
    const paymentMethod = categoryData.paymentMethod;

    // Get selected bank based on payment method
    let bankName: string | null = null;
    let branchName: string | null = null;
    let selectedBankAccount: IBankAccount | null = categoryData.selectedBankAccount;
    let selectedDepositBank: IBankDetails | null = categoryData.selectedDepositBank;

    if (paymentMethod === 'Cheque') {
      bankName = selectedBankAccount?.bankName || null;
      branchName = selectedBankAccount?.branchName || null;
    } else if (paymentMethod === 'Deposit') {
      bankName = selectedDepositBank?.bankName || null;
      branchName = categoryData.branch || null;
    }

    const requests = invoiceLinesData.map((line: any) => {
      console.log("subAccount full:", line.subAccount);
      console.log("parentAccount full:", line.parentAccount);

      const newVoucher: NewVoucher = {
        id: null,
        code: categoryData.voucherNumber,
        receiptDate: categoryData.voucherDate,
        amountNo: categoryData.amountNo,
        totalAmount: categoryData.amountPaying,
        totalAmountInWord: categoryData.amountPayingWords,
        comments: line.comments,
        refNo: categoryData.refNo,
        checkNo: categoryData.checkNo,
        checkDate: categoryData.checkDate ? dayjs(categoryData.checkDate) : null,
        bank: bankName,
        depBank: bankName,
        branch: branchName,
        term: paymentMethod,
        amount: line.lineAmount,
        isActive: true,
        subAccount: line.subAccount ? line.subAccount : null,
        parentAccount: line.parentAccount ? line.parentAccount : null,
      };

      console.log('Bank details for voucher:', { bankName, branchName, paymentMethod });
      console.log("voucher payload", newVoucher);
      return this.voucherService.create(newVoucher);
    });

    forkJoin(requests).subscribe({
      next: res => {
        this._snackBarService.open('Voucher saved successfully', 'Close', { duration: 3000 });

        this.updateInventoryAccount(this.totalSettlementValue)
          .then(() => {
            // Create vendor accounts
            this.createVendorAccountEntries();

            // Handle bank/cash based on payment method
            if (paymentMethod === 'Cheque' && selectedBankAccount && bankName) {
              // For cheque: create/update bank account (debit)
              this.createBankAccountEntries()
                .then(() => {
                  console.log('All accounts processed successfully');
                })
                .catch(error => {
                  console.error('Error processing bank account:', error);
                });
            } else if (paymentMethod === 'Deposit' && selectedDepositBank && bankName) {
              // For deposit: create/update bank account (debit)
              this.createBankAccountEntries()
                .then(() => {
                  console.log('All accounts processed successfully');
                })
                .catch(error => {
                  console.error('Error processing bank account:', error);
                });
            } else if (paymentMethod === 'Cash') {
              // For cash: update cash account (debit)
              this.updateCashAccount(this.totalSettlementValue);
            }
          })
          .catch(error => {
            console.error('Error in account processing:', error);
          });

        this.paymentTransferService.clearPayments();
        this.dialogRef.close(res);
      },
      error: err => {
        console.error('Error saving voucher:', err);
        this._snackBarService.open('Failed to save voucher', 'Close', { duration: 3000 });
      }
    });
  }


  private extractVendorName(description: string): string {
    // Extract vendor name from description format: "GRN: GRN_CODE - VENDOR_NAME"
    const match = description.match(/GRN: \w+ - (.+)$/);
    return match ? match[1].trim() : 'Unknown Vendor';
  }

  private createVendorAccountEntries(): void {
    const totalPaymentAmount = this.totalSettlementValue || 0;

    // Process vendor accounts first
    const vendorAccountPromises = this.paymentLines.map((paymentLine, index) => {
      return new Promise<void>((resolve, reject) => {
        let vendorName = this.extractVendorName(paymentLine.description);
        const vendorAmount = paymentLine.amount || 0;

        // Get the sub account and parent account from the corresponding invoice line
        const invoiceLine = this.invoiceLines.at(index) as FormGroup;
        const subAccount = invoiceLine.get('subAccount')?.value;
        const parentAccount = invoiceLine.get('parentAccount')?.value;

        // ✅ Generate the path that will be shown in the dropdown
        const accountPath = this.generateAccountPath(parentAccount, subAccount);

        console.log('Voucher account selection:', {
          vendorName,
          accountPath,
          subAccount,
          parentAccount
        });

        // Check if vendor account already exists
        const vendorParams = {
          'name.equals': vendorName,
          'parent.equals': 'Liability'
        };

        this.accountsService.query(vendorParams).subscribe({
          next: (vendorResponse) => {
            const existingVendorAccounts = vendorResponse.body || [];

            if (existingVendorAccounts.length > 0) {
              // Update existing vendor account
              this.updateExistingVendorAccount(
                existingVendorAccounts[0],
                vendorAmount,
                vendorName,
                accountPath // ✅ Pass the path
              ).then(() => resolve()).catch(error => reject(error));
            } else {
              // Create new vendor account
              this.createNewVendorAccount(
                vendorName,
                vendorAmount,
                accountPath // ✅ Pass the path
              ).then(() => resolve()).catch(error => reject(error));
            }
          },
          error: (error) => {
            console.error(`Error checking existing vendor account for ${vendorName}:`, error);
            // If search fails, create new vendor account
            this.createNewVendorAccount(
              vendorName,
              vendorAmount,
              accountPath // ✅ Pass the path
            ).then(() => resolve()).catch(error => reject(error));
          }
        });
      });
    });

    // Rest of the method remains the same...
    Promise.all(vendorAccountPromises)
      .then(() => {
        console.log('All vendor accounts updated successfully');
        return this.updateInventoryAccount(totalPaymentAmount);
      })
      .then(() => {
        console.log('Inventory account updated successfully');
        this.updateCashAccount(totalPaymentAmount);
      })
      .catch(error => {
        console.error('Error in vendor account creation process:', error);
      });
  }

  private createBankAccountEntries(): Promise<void> {
    return new Promise((resolve, reject) => {
      const paymentMethod = this.categoryForm.get('paymentMethod')?.value;
      const totalAmount = this.totalSettlementValue || 0;

      if (totalAmount <= 0) {
        console.warn('Invalid amount for bank account entry');
        resolve();
        return;
      }

      let bankName: string | null = null;

      if (paymentMethod === 'Cheque') {
        const selectedBankAccount: IBankAccount | null = this.categoryForm.get('selectedBankAccount')?.value;
        bankName = selectedBankAccount?.bankName || null;
      } else if (paymentMethod === 'Deposit') {
        const selectedDepositBank: IBankDetails | null = this.categoryForm.get('selectedDepositBank')?.value;
        bankName = selectedDepositBank?.bankName || null;
      }

      if (!bankName) {
        console.warn('No bank selected for bank account entry');
        resolve();
        return;
      }

      console.log(`Creating/updating bank account entry for ${bankName} with amount: ${totalAmount}`);

      // Check if bank account already exists
      const bankParams = {
        'name.equals': bankName,
        'parent.equals': 'Asset'
      };

      this.accountsService.query(bankParams).subscribe({
        next: (bankResponse) => {
          const existingBankAccounts = bankResponse.body || [];

          if (existingBankAccounts.length > 0) {
            this.updateExistingBankAccount(existingBankAccounts[0], totalAmount, bankName)
              .then(() => {
                console.log(`Bank account ${bankName} updated successfully`);
                resolve();
              })
              .catch(error => {
                console.error(`Error updating bank account ${bankName}:`, error);
                reject(error);
              });
          } else {
            this.createNewBankAccount(bankName, totalAmount)
              .then(() => {
                console.log(`New bank account ${bankName} created successfully`);
                resolve();
              })
              .catch(error => {
                console.error(`Error creating new bank account ${bankName}:`, error);
                reject(error);
              });
          }
        },
        error: (error) => {
          console.error(`Error checking existing bank account for ${bankName}:`, error);
          this.createNewBankAccount(bankName, totalAmount)
            .then(() => {
              console.log(`New bank account ${bankName} created after search failure`);
              resolve();
            })
            .catch(err => {
              console.error(`Error creating new bank account after search failure:`, err);
              reject(err);
            });
        }
      });
    });
  }

  private generateAccountPath(parentAccount: any, subAccount: any): string | null {
    if (!parentAccount || !subAccount) {
      return null;
    }

    // If subAccount has a full LMU path, use that directly
    if (subAccount.lmu && subAccount.lmu.includes('/')) {
      console.log('Using full LMU path from subAccount:', subAccount.lmu);
      return subAccount.lmu;
    }

    // If parentAccount has a full LMU path, try to combine with subAccount
    if (parentAccount.lmu && parentAccount.lmu.includes('/')) {
      const parentPath = parentAccount.lmu;

      // Extract sub account name
      let subAccountName = '';
      if (typeof subAccount === 'string') {
        subAccountName = subAccount;
      } else if (subAccount.lmu) {
        subAccountName = subAccount.lmu.split('/').pop()?.trim() || '';
      } else if (subAccount.type) {
        subAccountName = subAccount.type;
      } else if (subAccount.name) {
        subAccountName = subAccount.name;
      }

      if (subAccountName) {
        const fullPath = `${parentPath}/${subAccountName}`;
        console.log('Extended parent LMU path:', fullPath);
        return fullPath;
      }
    }

    // Fallback: Build path from individual names
    let parentName = '';
    let subAccountName = '';

    // Extract parent account name
    if (typeof parentAccount === 'string') {
      parentName = parentAccount;
    } else if (parentAccount.lmu) {
      parentName = parentAccount.lmu;
    } else if (parentAccount.type) {
      parentName = parentAccount.type;
    } else if (parentAccount.name) {
      parentName = parentAccount.name;
    }

    // Extract sub account name
    if (typeof subAccount === 'string') {
      subAccountName = subAccount;
    } else if (subAccount.lmu) {
      subAccountName = subAccount.lmu;
    } else if (subAccount.type) {
      subAccountName = subAccount.type;
    } else if (subAccount.name) {
      subAccountName = subAccount.name;
    }

    // Create the complete path
    if (parentName && subAccountName) {
      // If both already have paths, combine them properly
      let fullPath = parentName;
      if (!parentName.endsWith(subAccountName)) {
        fullPath = `${parentName}/${subAccountName}`;
      }
      console.log('Generated account path:', fullPath);
      return fullPath;
    }

    console.warn('Could not generate account path from:', { parentAccount, subAccount });
    return null;
  }

  private updateExistingVendorAccount(
    existingAccount: any,
    creditAmount: number,
    vendorName: string,
    accountPath: string | null
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const newCreditAmount = (existingAccount.creditAmount || 0) + creditAmount;
      const newTotalAmount = (existingAccount.amount || 0) + creditAmount;

      const updatedVendorAccount = {
        ...existingAccount,
        creditAmount: newCreditAmount,
        amount: newTotalAmount,
        date: dayjs(new Date()),
        path: accountPath // This is the key line - set the path
      };

      console.log(`Updating vendor account ${vendorName} with path: ${accountPath}`);

      this.accountsService.update(updatedVendorAccount).subscribe({
        next: (response) => {
          console.log(`Vendor account for ${vendorName} updated with path: ${accountPath}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error updating vendor account for ${vendorName}:`, error);
          reject(error);
        }
      });
    });
  }

  private updateExistingBankAccount(
    existingAccount: any,
    debitAmount: number,
    bankName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const newDebitAmount = (existingAccount.debitAmount || 0) + debitAmount;
      const newTotalAmount = (existingAccount.amount || 0) + debitAmount;

      const updatedBankAccount = {
        ...existingAccount,
        debitAmount: newDebitAmount, // Update DEBIT column
        amount: newTotalAmount,
        date: dayjs(new Date()),
        lastUpdated: dayjs(new Date())
      };

      console.log(`Updating bank account ${bankName} with debit amount: ${debitAmount}`);

      this.accountsService.update(updatedBankAccount).subscribe({
        next: (response) => {
          console.log(`Bank account ${bankName} updated successfully. Debit amount: ${newDebitAmount}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error updating bank account ${bankName}:`, error);
          reject(error);
        }
      });
    });
  }

  private createNewBankAccount(bankName: string, debitAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `BNK${randomNum}`;

      const bankAccountData: any = {
        code: accountCode,
        name: bankName,
        parent: 'Asset', // Bank accounts are assets
        date: dayjs(new Date()),
        child: 'Bank Account',
        amount: debitAmount,
        debitAmount: debitAmount, // Set DEBIT column
        creditAmount: null,
        description: `Bank account for ${bankName}`,
        isActive: true
      };

      console.log(`Creating new bank account ${bankName} with debit amount: ${debitAmount}`);

      this.accountsService.create(bankAccountData).subscribe({
        next: (response) => {
          console.log(`New bank account ${bankName} created successfully with debit amount: ${debitAmount}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error creating new bank account ${bankName}:`, error);
          reject(error);
        }
      });
    });
  }

  private createNewVendorAccount(
    vendorName: string,
    creditAmount: number,
    accountPath: string | null
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `VEN${randomNum}`;

      const vendorAccountData: any = {
        code: accountCode,
        name: vendorName,
        parent: 'Liability',
        date: dayjs(new Date()),
        child: vendorName,
        amount: creditAmount,
        creditAmount: creditAmount,
        debitAmount: null,
        path: accountPath // ✅ This is the key line - set the path
      };

      console.log(`Creating new vendor account ${vendorName} with path: ${accountPath}`);

      this.accountsService.create(vendorAccountData).subscribe({
        next: (response) => {
          console.log(`New vendor account created for ${vendorName} with path: ${accountPath}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error creating new vendor account for ${vendorName}:`, error);
          reject(error);
        }
      });
    });
  }

  private getAccountPathFromAccounts(subAccount: any, parentAccount: any): string | null {
    // Build path from selected subAccount and parentAccount
    if (subAccount && parentAccount) {
      const parentName = typeof parentAccount === 'string' ? parentAccount : parentAccount.lmu?.split('/')[0];
      const subAccountName = typeof subAccount === 'string' ? subAccount : subAccount.lmu?.split('/').pop();

      if (parentName && subAccountName) {
        return `${parentName}/${subAccountName}`;
      }
    }

    // Fallback to form value if available
    return this.getAccountPath();
  }

  private getAccountPath(): string | null {
    // Get account path from form if available, otherwise return null
    return this.categoryForm?.get('accountPath')?.value || null;
  }

  private updateInventoryAccount(creditAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const inventoryParams = {
        'name.equals': 'Inventory',
        'parent.equals': 'Asset'
      };

      this.accountsService.query(inventoryParams).subscribe({
        next: (inventoryResponse) => {
          const existingInventoryAccounts = inventoryResponse.body || [];

          if (existingInventoryAccounts.length > 0) {
            // Update existing inventory account - ADD to CREDIT column
            const inventoryAccount = existingInventoryAccounts[0];
            const newCreditAmount = (inventoryAccount.creditAmount || 0) + creditAmount;
            const newTotalAmount = (inventoryAccount.amount || 0) + creditAmount;

            const updatedInventoryAccount = {
              ...inventoryAccount,
              creditAmount: newCreditAmount, // Update CREDIT column
              amount: newTotalAmount,
              date: dayjs(new Date())
            };

            this.accountsService.update(updatedInventoryAccount).subscribe({
              next: (response) => {
                console.log('Inventory account updated successfully. Credit amount:', newCreditAmount);
                resolve();
              },
              error: (error) => {
                console.error('Error updating inventory account:', error);
                reject(error);
              }
            });
          } else {
            // Create new inventory account with credit amount
            this.createNewInventoryAccount(creditAmount)
              .then(() => resolve())
              .catch(error => reject(error));
          }
        },
        error: (error) => {
          console.error('Error checking existing inventory account:', error);
          reject(error);
        }
      });
    });
  }

  private createNewInventoryAccount(creditAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `INV${randomNum}`;

      const inventoryAccountData: any = {
        code: accountCode,
        name: 'Inventory',
        parent: 'Asset',
        date: dayjs(new Date()),
        child: 'Inventory',
        amount: creditAmount,
        creditAmount: creditAmount, // Set CREDIT column
        debitAmount: null,
        path: this.getAccountPath()
      };

      this.accountsService.create(inventoryAccountData).subscribe({
        next: (response) => {
          console.log('New inventory account created with credit amount:', creditAmount);
          resolve();
        },
        error: (error) => {
          console.error('Error creating inventory account:', error);
          reject(error);
        }
      });
    });
  }

  private updateCashAccount(debitAmount: number): void {
    const params = {
      'name.equals': 'Cash',
      'parent.equals': 'Asset'
    };

    this.accountsService.query(params).subscribe({
      next: (response) => {
        const existingCashAccounts = response.body || [];

        if (existingCashAccounts.length > 0) {
          // Update existing cash account - ADD to DEBIT column
          const cashAccount = existingCashAccounts[0];
          const newDebitAmount = (cashAccount.debitAmount || 0) + debitAmount;
          const newTotalAmount = (cashAccount.amount || 0) + debitAmount;

          const updatedCashAccount = {
            ...cashAccount,
            debitAmount: newDebitAmount, // Update DEBIT column
            amount: newTotalAmount,
            date: dayjs(new Date())
          };

          this.accountsService.update(updatedCashAccount).subscribe({
            next: (response) => {
              console.log('Cash account updated successfully. Debit amount:', newDebitAmount);
            },
            error: (error) => {
              console.error('Error updating cash account:', error);
              this.createNewCashAccount(debitAmount);
            }
          });
        } else {
          this.createNewCashAccount(debitAmount);
        }
      },
      error: (error) => {
        console.error('Error finding cash account:', error);
        this.createNewCashAccount(debitAmount);
      }
    });
  }

  private createNewCashAccount(debitAmount: number): void {
    const cashAccountCode = `CSH${Math.floor(1000 + Math.random() * 9000)}`;
    const cashAccountData: any = {
      code: cashAccountCode,
      name: 'Cash',
      parent: 'Asset',
      date: dayjs(new Date()),
      child: 'Cash',
      amount: debitAmount,
      creditAmount: null,
      debitAmount: debitAmount, // Set DEBIT column
      path: this.getAccountPath()
    };

    this.accountsService.create(cashAccountData).subscribe({
      next: (response) => {
        console.log('New cash account created successfully with debit amount:', debitAmount);
      },
      error: (error) => {
        console.error('Error creating cash account:', error);
      }
    });
  }

}
