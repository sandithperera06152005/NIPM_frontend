import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { ReceiptService } from 'app/entities/financemicro/receipt/service/receipt.service';
import { InventoryService } from 'app/entities/inventorymicro/inventory/service/inventory.service';
import { Observable, startWith, map } from 'rxjs';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IAccountType } from 'app/entities/financemicro/account-type/account-type.model';
import { IReceipt, NewReceipt } from 'app/entities/financemicro/receipt/receipt.model';
import { FormArray } from '@angular/forms';
import { forkJoin } from 'rxjs';
import dayjs from 'dayjs/esm';

import { IBankBranch } from 'app/entities/inventorymicro/bank-branch/bank-branch.model';
import { BankDetailsService } from 'app/entities/financemicro/bank-details/service/bank-details.service';
import { BankDetailsFormService } from 'app/entities/financemicro/bank-details/update/bank-details-form.service';
import { size } from 'lodash';
import { IBankDetails } from 'app/entities/financemicro/bank-details/bank-details.model';

import { PaymentTransferService } from 'app/entities/financemicro/service/payment-transfer.service';
import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';

// Remove the IBankOption interface since IBankDetails already has bankId

@Component({
  selector: 'app-receipt-create',
  standalone: true,
  imports: [
    CommonModule, MatIconModule,
    FormsModule, ReactiveFormsModule,
    MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule, MatAutocompleteModule, MatDatepickerModule,
    MatNativeDateModule, MatAutocomplete
  ],
  templateUrl: './receipt-create.component.html',
  styleUrl: './receipt-create.component.scss'
})

export class ReceiptCreateComponent implements OnInit {

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

  // Change to use IBankDetails instead of IBankOption
  bankControl = new FormControl<IBankDetails | string>('');
  filteredBanks!: Observable<IBankDetails[]>;

  branchControl = new FormControl('');
  filteredBranches!: Observable<string[]>;

  maxDate = new Date();
  loadReceipts: any;

  bankList: IBankDetails[] = []; // Changed from IBankOption[] to IBankDetails[]
  allBankDetails: IBankDetails[] = [];

  branchList: string[] = [];
  editBankForm = this._bankDetailsFormService.createBankDetailsFormGroup();
  bankForm = this._bankDetailsFormService.getBankDetails(this.editBankForm);

  paymentLines: any[] = [];
  totalSettlementValue: number = 0;

  filteredPaths!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,

    public dialogRef: MatDialogRef<ReceiptCreateComponent>,
    public _snackBarService: MatSnackBar,
    private receiptService: ReceiptService,
    private _bankDetailsService: BankDetailsService,
    private _bankDetailsFormService: BankDetailsFormService,
    private accountsService: AccountsService,

    @Inject(MAT_DIALOG_DATA) public data: { supplier: any },

    private paymentTransferService: PaymentTransferService

  ) {

    this.invoiceLines = this.fb.array([this.createInvoiceLine()]);
    this.invoiceForm = this.fb.group({
      lines: this.invoiceLines
    });

    this.categoryForm = this.fb.group({
      paymentMethod: [''],
      receiptNumber: [''],
      receiptDate: [new Date(), Validators.required],
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

      accountPath: [''],
    });

    // Clear payment data when this dialog is closed by any means
    this.dialogRef.afterClosed().subscribe((result) => {
      // Only clear if this dialog was opened from customer payments (has payment lines)
      if (this.paymentLines.length > 0) {
        this.paymentTransferService.clearPayments();
      }
    });
  }


  ngOnInit(): void {

    this.getAllBanks()

    this.paymentLines = this.paymentTransferService.getPayments();
    this.totalSettlementValue = this.paymentTransferService.getTotalSettlementValue();

    console.log('Payment lines:', this.paymentLines);
    console.log('Total settlement value:', this.totalSettlementValue);

    if (this.categoryForm) {
      this.categoryForm.patchValue({
        amount: this.totalSettlementValue,
        amountPaying: this.totalSettlementValue,
      });
    }

    this.paymentLines.forEach(line => {
      this.addInvoiceLineWithData(line.description, line.amount);
    });

    // Remove this duplicate filteredBanks setup - it's now in getAllBanks()
    // this.filteredBanks = this.bankControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filterBanks(value || ''))
    // );

    this.categoryForm.addControl('cheqBank', this.bankControl);

    this.fetchCategories();

    this.categoryForm.get('paymentMethod')?.valueChanges.subscribe(() => {
      this.generateReceiptNumber();
      this.validateAmountsMatch();
    });

    this.categoryForm.get('amountPaying')?.valueChanges.subscribe(value => {
      if (value && !isNaN(value)) {
        const words = this.numberToWords(Number(value));
        this.categoryForm.get('amountPayingWords')?.setValue(words + ' Only', { emitEvent: false });
      } else {
        this.categoryForm.get('amountPayingWords')?.setValue('', { emitEvent: false });
      }

      this.categoryForm.get('depAmount')?.valueChanges.subscribe(() => {
        this.validateDepositAmount();
      });

      this.categoryForm.get('amountPaying')?.valueChanges.subscribe(() => {
        this.validateDepositAmount();
      });
    });

    this.invoiceLines.valueChanges.subscribe(() => {
      this.validateAmountsMatch();
    });

    // Use invoiceForm for filtering instead of subAccountForm
    this.filteredCategories = this.invoiceForm.controls['subAccount'].valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.lmu?.split('/').pop() ?? '';
        return this.categories.filter(cat =>
          cat.lmu?.split('/').pop()?.toLowerCase().includes(name.toLowerCase())
        );
      })
    );

    // populate invoice lines with payment data
    if (this.paymentLines && this.paymentLines.length > 0) {
      this.populateInvoiceLines(this.paymentLines);
      console.log('Invoice lines populated with payment data');
    } else {
      console.warn('No payment lines found to populate');
      // Add one empty line if no payments
      this.addLine();
    }

    this.dialogRef.afterClosed().subscribe(() => {
      this.paymentTransferService.clearPayments();
    });

    this.filteredPaths = this.categoryForm.get('accountPath')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterPaths(value || ''))
    );
  }

  private filterPaths(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.categories
      .map(c => c.lmu || '')
      .filter(path => path.toLowerCase().includes(filterValue));
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

  populateInvoiceLines(payments: any[]) {
    // Clear any existing lines first
    this.invoiceLines.clear();

    if (payments && payments.length > 0) {
      payments.forEach((payment, index) => {
        const lineGroup = this.fb.group({
          subAccount: [null],
          parentAccount: [null],
          comments: [payment.description || `Payment ${index + 1}`],
          lineAmount: [payment.amount, Validators.required]
        });

        this.invoiceLines.push(lineGroup);
      });
    } else {
      // Only add empty line if no payments exist
      this.addLine();
    }

    this.validateAmountsMatch();
  }

  private _filterBanks(value: string): IBankDetails[] {
    const filterValue = value.toLowerCase();
    return this.bankList.filter(bank =>
      bank.bankName?.toLowerCase().includes(filterValue)
    );
  }

  displayBank(bank: IBankDetails | string | null): string {
    return typeof bank === 'string' ? bank : bank?.bankName ?? '';
  }

  onBankSelected(bank: IBankDetails): void {
    console.log('Bank selected:', bank);

    // Clear branch selection when bank changes
    this.branchControl.setValue('');
    this.categoryForm.patchValue({
      branch: ''
    });

    // Enable branch control
    this.branchControl.enable();

    // Force update of the filtered branches
    this.branchControl.updateValueAndValidity();

    // Manually trigger value changes to refresh the branch list
    setTimeout(() => {
      this.branchControl.setValue('');
    });
  }

  onBankBlur(): void {
    const value = this.bankControl.value;
    if (typeof value === 'string') {
      const foundBank = this.bankList.find(
        bank => bank.bankName?.toLowerCase() === value.toLowerCase()
      );
      if (foundBank) {
        this.bankControl.setValue(foundBank);
        this.onBankSelected(foundBank);
      } else {
        // If no exact match, clear the selection
        this.bankControl.setValue('');
        this.branchControl.disable();
      }
    }
  }

  onBranchSelected(branch: string): void {
    this.categoryForm.patchValue({
      branch: branch
    });
  }

  createInvoiceLine(): FormGroup {
    return this.fb.group({
      subAccount: [null, Validators.required],
      parentAccount: [null, Validators.required],
      comments: [''],
      lineAmount: ['', Validators.required]
    });
  }

  onPaymentMethodChange(event: any): void {
    const paymentMethod = event.value;

    // Clear bank and branch controls when payment method changes
    this.bankControl.setValue('');
    this.branchControl.setValue('');
    this.categoryForm.patchValue({
      branch: '',
      checkDate: '',
      checkNo: '',
      amountNo: '',
      refNo: '',
      depAmount: ''
    });

    // Re-enable the bank control (it might have been disabled)
    this.bankControl.enable();
    this.branchControl.enable();

    // Update the filteredBranches observable to trigger update
    this.branchControl.updateValueAndValidity();

    // This forces the dropdown to close properly
    setTimeout(() => {
      // Any additional logic you want to run
    }, 0);
  }

  addLine(): void {
    if (this.paymentLines.length === 0) {
      this.invoiceLines.push(this.createInvoiceLine());
    }
  }

  getAllBanks(): void {
    this._bankDetailsService.query({ page: 0, size: 2000 }).subscribe((bankRes) => {
      this.allBankDetails = bankRes.body || [];

      // Create unique bank list from bank_id column
      const bankMap = new Map<number, IBankDetails>();

      this.allBankDetails.forEach(detail => {
        // Make sure bankId exists and is not null/undefined
        if (detail.bankId != null && detail.bankName) {
          // Check if we already have this bankId in the map
          if (!bankMap.has(detail.bankId)) {
            bankMap.set(detail.bankId, detail);
          }
        }
      });

      this.bankList = Array.from(bankMap.values());

      // Setup filteredBanks observable
      this.filteredBanks = this.bankControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.bankName ?? '';
          return name ? this.filterBanks(name) : this.bankList.slice();
        })
      );

      // Setup filteredBranches observable
      this.filteredBranches = this.branchControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterBranches(value || ''))
      );

      console.log('Banks loaded:', this.bankList.length);
    });
  }

  private filterBanks(name: string): IBankDetails[] {
    const filterValue = name.toLowerCase();
    return this.bankList.filter(b =>
      b.bankName?.toLowerCase().includes(filterValue)
    );
  }

  private filterBranches(value: string): string[] {
    const filterValue = value.toLowerCase();
    const selectedBank = this.bankControl.value as IBankDetails;

    // If no bank is selected or bank is invalid, return empty array
    if (!selectedBank || typeof selectedBank === 'string' || selectedBank.bankId == null) {
      return [];
    }

    // Find all branches where branch_id equals the selected bank's bankId
    const branchesForBank = this.allBankDetails
      .filter(bankDetail => {
        const hasBranchName = !!bankDetail.branchName;
        const matchesBankId = bankDetail.branchId === selectedBank.bankId;

        return hasBranchName && matchesBankId;
      })
      .map(bankDetail => bankDetail.branchName!)
      .filter((branchName): branchName is string => !!branchName);

    // Remove duplicates
    const uniqueBranches = [...new Set(branchesForBank)];

    // Filter by search input
    return uniqueBranches.filter(branch =>
      branch.toLowerCase().includes(filterValue)
    );
  }

  removeLine(index: number): void {
    this.invoiceLines.removeAt(index);
  }

  getLineControl(index: number, controlName: string) {
    return (this.invoiceLines.at(index) as FormGroup).get(controlName) as FormControl;
  }

  setupFilteringForLine(index: number) {
    const control = this.getLineControl(index, 'subAccount');
    return control.valueChanges.pipe(
      startWith(''),
      map(value => {
        let searchTerm = '';

        if (typeof value === 'string') {
          // when typing
          searchTerm = value.toLowerCase();
        } else if (value && typeof value === 'object') {
          // when an object is selected
          searchTerm = value.lmu?.split('/').pop()?.toLowerCase() || '';
        }

        searchTerm = searchTerm.toLowerCase();

        return this.categories.filter(cat =>
          cat.lmu?.split('/').pop()?.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  get amountPaying(): number {
    return parseFloat(this.categoryForm.get('amountPaying')?.value) || 0;
  }

  // Add this method to calculate total of invoice lines
  calculateInvoiceLinesTotal(): number {
    let total = 0;
    this.invoiceLines.controls.forEach(lineControl => {
      const lineAmount = lineControl.get('lineAmount')?.value;
      const amount = parseFloat(lineAmount) || 0;
      total += amount;
    });
    return total;
  }

  // Add this validation method
  validateAmountsMatch(): void {
    const receiptAmount = parseFloat(this.categoryForm.get('amountPaying')?.value) || 0;
    const linesTotal = this.calculateInvoiceLinesTotal();

    if (Math.abs(receiptAmount - linesTotal) > 0.01) {
      this.categoryForm.get('amountPaying')?.setErrors({ amountMismatch: true });
    } else {
      this.categoryForm.get('amountPaying')?.setErrors(null);
    }
  }

  validateDepositAmount(): void {
    const depAmount = parseFloat(this.categoryForm.get('depAmount')?.value) || 0;
    const amountPaying = parseFloat(this.categoryForm.get('amountPaying')?.value) || 0;

    if (this.categoryForm.get('paymentMethod')?.value === 'Bank Deposits') {
      if (Math.abs(depAmount - amountPaying) > 0.01) {
        this.categoryForm.get('depAmount')?.setErrors({ mismatch: true });
        this.categoryForm.get('amountPaying')?.setErrors({ mismatch: true });
      } else {
        this.categoryForm.get('depAmount')?.setErrors(null);
        this.categoryForm.get('amountPaying')?.setErrors(null);
      }
    }
  }

  displaySubAccount(cat: IAccountType | string): string {
    if (typeof cat === 'string') {
      return cat; // Return the string as is when typing
    }
    return cat ? cat.lmu?.split('/').pop() ?? '' : '';
  }

  fetchCategories() {
    this.categoryService.query({ size: 1000 }).subscribe({
      next: (res) => {
        this.categories = res.body || [];
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
      }
    });
  }

  onParentChange(parent: any) {
    console.log('Selected parent account:', parent);
  }

  generateReceiptNumber() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const receiptNumber = `RCPT${randomNumber}`;
    this.categoryForm.get('receiptNumber')?.setValue(receiptNumber);
  }

  get parentCategories() {
    // Example: if `lmu` looks like "Parent/SubAccount"
    // then parent accounts are the ones with no "/"
    return this.categories.filter(cat => !cat.lmu?.includes('/'));
  }

  numberToWords(num: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
      'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
      'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num || 0) === 0) return 'Zero';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + this.numberToWords(num % 100) : '');
    if (num < 100000) return this.numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + this.numberToWords(num % 1000) : '');
    if (num < 10000000) return this.numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + this.numberToWords(num % 100000) : '');
    return this.numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + this.numberToWords(num % 10000000) : '');
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

  /**
   * Display helper for parent account. Accepts either an IAccountType-like object or a simple string.
   */
  displayParentAccount(parent: IAccountType | string | null | undefined): string {
    if (!parent) return '';
    if (typeof parent === 'string') return parent;

    return parent.type ?? parent.lmu ?? parent.code ?? '';
  }

  onStepBack(): void {
    // Clear the amountMismatch error when going back to the first step
    if (this.categoryForm.get('amountPaying')?.hasError('amountMismatch')) {
      this.categoryForm.get('amountPaying')?.setErrors(null);
    }
  }

  onSave(): void {
    this.validateAmountsMatch();
    if (this.categoryForm.get('amountPaying')?.hasError('amountMismatch')) {
      this._snackBarService.open('Amount paying must match invoice lines total', 'Close', {
        duration: 3000,
      });
      return;
    }

    const categoryData = this.categoryForm.value;
    const invoiceLinesData = this.invoiceLines.value; // array of lines
    const bank = this.bankControl.value as IBankDetails;
    const bankName = bank?.bankName || categoryData.cheqBank || '';
    const paymentMethod = categoryData.paymentMethod;

    const requests = invoiceLinesData.map((line: any) => {
      console.log("subAccount full:", line.subAccount);
      console.log("parentAccount full:", line.parentAccount);

      const newReceipt: NewReceipt = {
        id: null,
        code: categoryData.receiptNumber,
        receiptDate: dayjs(categoryData.receiptDate).hour(12),
        customerName: paymentMethod === 'Cheque' ? line.comments : categoryData.customerName,
        customerAddress: categoryData.customerAddress,
        totalAmount: categoryData.amountPaying,
        totalAmountInWord: categoryData.amountInWords,
        amountNo: categoryData.amountNo,
        refNo: categoryData.refNo,
        depAmount: categoryData.depAmount,
        comments: line.comments,
        lmu: categoryData.lmu,
        termId: categoryData.termId,
        term: categoryData.paymentMethod,
        date: dayjs(categoryData.receiptDate).hour(12),
        amount: line.lineAmount,
        checkDate: categoryData.checkDate ? dayjs(categoryData.checkDate).hour(12) : null,
        checkNo: categoryData.checkNo,
        bank: bankName,
        depBank: bankName,
        branch: categoryData.branch || null,
        customerId: categoryData.customerId,
        isActive: true,
        deposited: categoryData.deposited ?? false,
        createdBy: categoryData.createdBy,

        // send only IDs
        subAccount: line.subAccount ? line.subAccount : null,
        parentAccount: line.parentAccount ? line.parentAccount : null,
      };

      console.log('Selected bank object:', categoryData.cheqBank);
      console.log("receipt payload", newReceipt);

      return this.receiptService.create(newReceipt); // Observable
    });

    forkJoin(requests).subscribe({
      next: res => {
        console.log('All lines saved:', res);
        this._snackBarService.open('Receipt saved successfully', 'Close', {
          duration: 3000,
        });

        // CREATE CHEQUE REGISTRY, ACCOUNT ENTRIES HERE
        // Process all entries in sequence
        const paymentMethod = this.categoryForm.get('paymentMethod')?.value;
        const bank = this.bankControl.value as IBankDetails;
        const bankName = bank?.bankName || this.categoryForm.get('cheqBank')?.value || '';

        let promise = Promise.resolve();
        promise = promise.then(() => this.createAccountEntry());
        if ((paymentMethod === 'Cheque' || paymentMethod === 'Bank Deposits') && bankName) {
          promise = promise.then(() => this.createBankAccountEntries());
        }
        promise.then(() => {
          console.log('All processed successfully');
          this.paymentTransferService.clearPayments();
          this.dialogRef.close(res);
        })
          .catch(error => {
            console.error('Error in processing:', error);
            this.paymentTransferService.clearPayments();
            this.dialogRef.close(res);
          });
      },

      error: err => {
        console.error('Error saving lines:', err);
        this._snackBarService.open('Failed to create receipt lines', 'Close', {
          duration: 3000,
        });
      }
    });
  }


  private createBankAccountEntries(): Promise<void> {
    return new Promise((resolve, reject) => {
      const categoryData = this.categoryForm.value;
      const paymentMethod = categoryData.paymentMethod;
      const totalAmount = this.totalSettlementValue || 0;

      if (totalAmount <= 0) {
        console.warn('Invalid amount for bank account entry');
        resolve();
        return;
      }

      // Get bank name based on selected bank
      const bank = this.bankControl.value as IBankDetails;
      const bankName = bank?.bankName || categoryData.cheqBank || '';

      if (!bankName) {
        console.warn('No bank selected for bank account entry');
        resolve();
        return;
      }

      console.log(`Creating/updating bank account entry for ${bankName} with amount: ${totalAmount}`);

      // Check if bank account already exists
      const bankParams = {
        'name.equals': bankName,
        'parent.equals': 'Asset' // Bank accounts are typically under Assets
      };

      this.accountsService.query(bankParams).subscribe({
        next: (bankResponse) => {
          const existingBankAccounts = bankResponse.body || [];

          if (existingBankAccounts.length > 0) {
            // Update existing bank account - ADD to CREDIT column
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
            // Create new bank account with credit amount
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
          // If search fails, create new bank account
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

  private updateExistingBankAccount(
    existingAccount: any,
    creditAmount: number,
    bankName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // For receipts, bank accounts receive CREDIT (money is coming into the bank)
      const newCreditAmount = (existingAccount.creditAmount || 0) + creditAmount;
      const newTotalAmount = (existingAccount.amount || 0) + creditAmount;

      const updatedBankAccount = {
        ...existingAccount,
        creditAmount: newCreditAmount, // Update CREDIT column
        amount: newTotalAmount,
        date: dayjs(new Date()),
        lastUpdated: dayjs(new Date())
      };

      console.log(`Updating bank account ${bankName} with credit amount: ${creditAmount}`);

      this.accountsService.update(updatedBankAccount).subscribe({
        next: (response) => {
          console.log(`Bank account ${bankName} updated successfully. Credit amount: ${newCreditAmount}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error updating bank account ${bankName}:`, error);
          reject(error);
        }
      });
    });
  }

  private createNewBankAccount(bankName: string, creditAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `BNK${randomNum}`;

      const bankAccountData: any = {
        code: accountCode,
        name: bankName,
        parent: 'Asset', // Bank accounts are assets
        date: dayjs(new Date()),
        child: 'Bank Account',
        amount: creditAmount,
        creditAmount: creditAmount, // Set CREDIT column (money coming in)
        debitAmount: null, // Leave debit unchanged
        description: `Bank account for ${bankName}`,
        isActive: true
      };

      console.log(`Creating new bank account ${bankName} with credit amount: ${creditAmount}`);

      this.accountsService.create(bankAccountData).subscribe({
        next: (response) => {
          console.log(`New bank account ${bankName} created successfully with credit amount: ${creditAmount}`);
          resolve();
        },
        error: (error) => {
          console.error(`Error creating new bank account ${bankName}:`, error);
          reject(error);
        }
      });
    });
  }

  // ... rest of the methods remain the same (createAccountEntry, etc.)
  private createAccountEntry(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get total payment amount from all customers
      const totalPaymentAmount = this.totalSettlementValue || 0;

      // Process all customer accounts first
      const customerAccountPromises = this.paymentLines.map(paymentLine => {
        return new Promise<void>((innerResolve, innerReject) => {
          // Extract vehicle owner name from each payment line description
          let vehicleOwnerName = '';
          if (paymentLine.description) {
            const parts = paymentLine.description.split(' - ');
            if (parts.length >= 3) {
              vehicleOwnerName = parts[2];
            }
          }

          if (!vehicleOwnerName) {
            vehicleOwnerName = 'Vehicle Owner';
          }

          // Get the specific amount for this customer from the payment line
          const customerAmount = paymentLine.amount || 0;

          // Check if customer account already exists
          const customerParams = {
            'name.equals': vehicleOwnerName,
            'parent.equals': 'Liability'
          };

          // Handle customer account only
          this.accountsService.query(customerParams).subscribe({
            next: (customerResponse) => {
              const existingCustomerAccounts = customerResponse.body || [];

              if (existingCustomerAccounts.length > 0) {
                // Update existing customer account - ADD to DEBIT column
                this.updateExistingCustomerAccount(existingCustomerAccounts[0], customerAmount, vehicleOwnerName)
                  .then(() => innerResolve())
                  .catch(error => innerReject(error));
              } else {
                // Create new customer account
                this.createNewCustomerAccount(vehicleOwnerName, customerAmount)
                  .then(() => innerResolve())
                  .catch(error => innerReject(error));
              }
            },
            error: (error) => {
              console.error(`Error checking existing customer account for ${vehicleOwnerName}:`, error);
              // If search fails, create new account
              this.createNewCustomerAccount(vehicleOwnerName, customerAmount)
                .then(() => innerResolve())
                .catch(error => innerReject(error));
            }
          });
        });
      });

      // Wait for all customer accounts to be processed, then handle inventory and cash accounts
      Promise.all(customerAccountPromises)
        .then(() => {
          console.log('All customer accounts updated successfully');

          // Now handle inventory account ONCE with the TOTAL amount
          return this.handleInventoryAccount(totalPaymentAmount);
        })
        .then(() => {
          console.log('Inventory account updated successfully');

          // Finally update cash account with TOTAL amount
          this.updateCashAccount(totalPaymentAmount);
          resolve();
        })
        .catch(error => {
          console.error('Error in account creation process:', error);
          reject(error);
        });
    });
  }

  private handleInventoryAccount(debitAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const inventoryParams = {
        'name.equals': 'Inventory',
        'parent.equals': 'Asset'
      };

      this.accountsService.query(inventoryParams).subscribe({
        next: (inventoryResponse) => {
          const existingInventoryAccounts = inventoryResponse.body || [];

          if (existingInventoryAccounts.length > 0) {
            // Update existing inventory account - ADD to DEBIT column
            this.updateExistingInventoryAccount(existingInventoryAccounts[0], debitAmount)
              .then(() => resolve())
              .catch(error => reject(error));
          } else {
            // Create new inventory account
            this.createNewInventoryAccount(debitAmount)
              .then(() => resolve())
              .catch(error => reject(error));
          }
        },
        error: (error) => {
          console.error('Error checking existing inventory account:', error);
          // If search fails, create new inventory account
          this.createNewInventoryAccount(debitAmount)
            .then(() => resolve())
            .catch(error => reject(error));
        }
      });
    });
  }

  private updateExistingCustomerAccount(existingAccount: any, debitAmount: number, customerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const newDebitAmount = (existingAccount.debitAmount || 0) + debitAmount;
      const newTotalAmount = (existingAccount.amount || 0) + debitAmount;

      const updatedCustomerAccount = {
        ...existingAccount,
        debitAmount: newDebitAmount,
        amount: newTotalAmount,
        date: dayjs(new Date())
      };

      this.accountsService.update(updatedCustomerAccount).subscribe({
        next: (response) => {
          console.log(`Customer account for ${customerName} updated successfully. Debit amount:`, newDebitAmount);
          resolve();
        },
        error: (error) => {
          console.error(`Error updating customer account for ${customerName}:`, error);
          reject(error);
        }
      });
    });
  }

  private createNewCustomerAccount(vehicleOwnerName: string, debitAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `CUS${randomNum}`;

      const customerAccountData: any = {
        code: accountCode,
        name: vehicleOwnerName,
        parent: 'Liability',
        date: dayjs(new Date()),
        child: vehicleOwnerName,
        amount: debitAmount,
        creditAmount: null,
        debitAmount: debitAmount,
        path: this.categoryForm.get('accountPath')?.value || null
      };

      this.accountsService.create(customerAccountData).subscribe({
        next: (customerResponse) => {
          console.log(`New customer account created for ${vehicleOwnerName}:`, customerResponse);
          resolve();
        },
        error: (error) => {
          console.error(`Error creating new customer account for ${vehicleOwnerName}:`, error);
          reject(error);
        }
      });
    });
  }

  private updateExistingInventoryAccount(existingAccount: any, debitAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const newDebitAmount = (existingAccount.debitAmount || 0) + debitAmount;
      const newTotalAmount = (existingAccount.amount || 0) + debitAmount;

      const updatedInventoryAccount = {
        ...existingAccount,
        debitAmount: newDebitAmount,
        amount: newTotalAmount,
        date: dayjs(new Date())
      };

      this.accountsService.update(updatedInventoryAccount).subscribe({
        next: (response) => {
          console.log('Inventory account updated successfully. Debit amount:', newDebitAmount);
          resolve();
        },
        error: (error) => {
          console.error('Error updating inventory account:', error);
          reject(error);
        }
      });
    });
  }

  private createNewInventoryAccount(debitAmount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const accountCode = `INV${randomNum}`;

      const inventoryAccountData: any = {
        code: accountCode,
        name: 'Inventory',
        parent: 'Asset',
        date: dayjs(new Date()),
        child: 'Inventory',
        amount: debitAmount,
        creditAmount: null,
        debitAmount: debitAmount,
        path: this.categoryForm.get('accountPath')?.value || null
      };

      this.accountsService.create(inventoryAccountData).subscribe({
        next: (response) => {
          console.log('New inventory account created with debit amount:', debitAmount);
          resolve();
        },
        error: (error) => {
          console.error('Error creating inventory account:', error);
          reject(error);
        }
      });
    });
  }

  private updateCashAccount(creditAmount: number): void {
    const params = {
      'name.equals': 'Cash',
      'parent.equals': 'Asset'
    };

    this.accountsService.query(params).subscribe({
      next: (response) => {
        const existingCashAccounts = response.body || [];

        if (existingCashAccounts.length > 0) {
          // Update existing cash account - ADD to CREDIT column
          const cashAccount = existingCashAccounts[0];
          const newCreditAmount = (cashAccount.creditAmount || 0) + creditAmount;
          const newTotalAmount = (cashAccount.amount || 0) + creditAmount;

          const updatedCashAccount = {
            ...cashAccount,
            creditAmount: newCreditAmount,
            amount: newTotalAmount,
            date: dayjs(new Date())
          };

          this.accountsService.update(updatedCashAccount).subscribe({
            next: (response) => {
              console.log('Cash account updated successfully. Credit amount:', newCreditAmount);
            },
            error: (error) => {
              console.error('Error updating cash account:', error);
              this.createNewCashAccount(creditAmount);
            }
          });
        } else {
          this.createNewCashAccount(creditAmount);
        }
      },
      error: (error) => {
        console.error('Error finding cash account:', error);
        this.createNewCashAccount(creditAmount);
      }
    });
  }

  private createNewCashAccount(creditAmount: number): void {
    const cashAccountCode = `CSH${Math.floor(1000 + Math.random() * 9000)}`;
    const cashAccountData: any = {
      code: cashAccountCode,
      name: 'Cash',
      parent: 'Asset',
      date: dayjs(new Date()),
      child: 'Cash',
      amount: creditAmount,
      creditAmount: creditAmount,
      debitAmount: null,
      path: this.categoryForm.get('accountPath')?.value || null
    };

    this.accountsService.create(cashAccountData).subscribe({
      next: (response) => {
        console.log('New cash account created successfully with credit amount:', creditAmount);
      },
      error: (error) => {
        console.error('Error creating cash account:', error);
      }
    });
  }
}