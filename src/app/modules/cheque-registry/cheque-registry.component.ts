import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import dayjs from 'dayjs/esm';

import { ChequeRegistryService } from 'app/entities/financemicro/cheque-registry/service/cheque-registry.service';
import { IChequeRegistry } from 'app/entities/financemicro/cheque-registry/cheque-registry.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BankAccountService } from 'app/entities/financemicro/bank-account/service/bank-account.service';
import { IBankAccount } from 'app/entities/financemicro/bank-account/bank-account.model';
import { MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cheque-registry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule,
    MatTabsModule,
  ],
  templateUrl: './cheque-registry.component.html',
  styleUrl: './cheque-registry.component.scss',
})
export class ChequeRegistryComponent implements OnInit {
  displayedColumns = [
    'receiptCode',
    'customerName',
    'bankName',
    'chequeNo',
    'amount',
    'chequeDate',
    'depositedDate',
    'bankAccount',
    'status',
    'isChanged',
    'chrFrmCus',
    'returnFee',
    'action',
  ];

  searchMode: 'receiptCode' | 'chequeNo' | 'customerName' = 'receiptCode';

  searchInputControl = new FormControl('');
  searchPlaceholder = 'Search by Receipt Code';

  customerDataSource = new MatTableDataSource<IChequeRegistry>();
  companyDataSource = new MatTableDataSource<IChequeRegistry>();

  selectedTab = 0;

  totalItems = 0;
  itemsPerPage = 10;

  bankAccounts: IBankAccount[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private chequeRegistryService: ChequeRegistryService,
    private bankAccountService: BankAccountService
  ) { }

  ngOnInit(): void {
    this.loadChequeRegistries();
    this.loadBankAccounts();

    this.searchInputControl.valueChanges.subscribe(() => {
      this.applySearch();
    });
  }

  setSearchMode(mode: 'receiptCode' | 'chequeNo' | 'customerName'): void {
    this.searchMode = mode;

    this.searchPlaceholder =
      mode === 'receiptCode'
        ? 'Search by Receipt Code'
        : mode === 'chequeNo'
          ? 'Search by Cheque No'
          : 'Search by Customer';

    // Clear search when switching modes
    this.searchInputControl.setValue('');
  }

  applySearch(): void {
    const filterValue = (this.searchInputControl.value || '').trim().toLowerCase();

    this.activeDataSource.filterPredicate = (
      data: IChequeRegistry,
      filter: string
    ): boolean => {
      switch (this.searchMode) {
        case 'receiptCode':
          return data.receiptCode?.toLowerCase().includes(filter);

        case 'chequeNo':
          return data.chequeNo?.toLowerCase().includes(filter);

        case 'customerName':
          return data.customerName?.toLowerCase().includes(filter);

        default:
          return false;
      }
    };

    this.activeDataSource.filter = filterValue;

    // Reset paginator after filtering
    if (this.activeDataSource.paginator) {
      this.activeDataSource.paginator.firstPage();
    }
  }

  refreshFilters(): void {
    // Reset search mode
    this.searchMode = 'receiptCode';
    this.searchPlaceholder = 'Search by Receipt Code';

    // Clear search input
    this.searchInputControl.setValue('');

    // Clear table filter
    this.activeDataSource.filter = '';

    // Reset paginator
    if (this.activeDataSource.paginator) {
      this.activeDataSource.paginator.firstPage();
    }
  }


  ngAfterViewInit(): void {
    this.customerDataSource.paginator = this.paginator;
    this.companyDataSource.paginator = this.paginator;

  }

  loadChequeRegistries(): void {
    this.chequeRegistryService.query().subscribe(res => {
      const all = (res.body ?? []).filter(
        r => r.chequeNo && r.chequeNo.trim() !== ''
      );

      // Company cheques (Voucher-created)
      this.companyDataSource.data = all.filter(
        r => r.receiptCode?.startsWith('V')   // adjust prefix if needed
      );

      // Customer cheques (Receipt-created)
      this.customerDataSource.data = all.filter(
        r => !r.receiptCode?.startsWith('V')
      );

      this.totalItems =
        this.selectedTab === 0
          ? this.customerDataSource.data.length
          : this.companyDataSource.data.length;
    });
  }

  get activeDataSource(): MatTableDataSource<IChequeRegistry> {
    return this.selectedTab === 0
      ? this.customerDataSource
      : this.companyDataSource;
  }


  loadBankAccounts(): void {
    this.bankAccountService.query({ page: 0, size: 10000 }).subscribe(res => {
      this.bankAccounts = res.body || [];
    });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.totalItems = this.activeDataSource.data.length;
    this.refreshFilters();
  }



  saveRegistry(registry: IChequeRegistry): void {
    const payload: IChequeRegistry = {
      ...registry,
      chequeDate: registry.chequeDate ? dayjs(registry.chequeDate) : null,
      depositedDate: dayjs(),
      lmd: dayjs(),
    };

    this.chequeRegistryService.update(payload).subscribe({
      next: () => {
        console.log('Cheque registry updated');
        this.loadChequeRegistries(); // Refresh the page data
      },
      error: err => {
        console.error('Error updating cheque registry', err);
      },
    });
  }




}
