import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import dayjs from 'dayjs/esm';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { JournalVoucherService } from 'app/entities/financemicro/journal-voucher/service/journal-voucher.service';
import { IJournalVoucher, NewJournalVoucher } from 'app/entities/financemicro/journal-voucher/journal-voucher.model';
import { JournalVoucherCreateComponent } from '../journal-voucher-create/journal-voucher-create.component';
import { JournalVoucherViewComponent } from '../journal-voucher-view/journal-voucher-view.component';
import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';

@Component({
  selector: 'app-journal-voucher',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule
  ],
  templateUrl: './journal-voucher.component.html',
  styleUrls: ['./journal-voucher.component.scss'],
})
export class JournalVoucherComponent implements OnInit {
  searchMode: 'code' | 'comments' = 'code';
  searchPlaceholder: string = 'Search by Voucher Code';

  private _dialog = inject(MatDialog);

  @ViewChild(MatPaginator) _paginator: MatPaginator;
  searchInputControl = new FormControl();
  noRecord = false;
  showClear = false;

  itemsPerPage = 10;
  totalItems = 0;
  page = 1;
  allJournals: IJournalVoucher[] = [];

  private dialog = inject(MatDialog);
  private _journalVoucherService = inject(JournalVoucherService);
  private _router = inject(Router);
  private _snackBarService = inject(MatSnackBar);
  private _accountsService = inject(AccountsService);

  dataSource = new MatTableDataSource<IJournalVoucher>([]);

  expandedVoucher: any | null = null;
  expandedEntries: any[] = [];

  displayedColumns: string[] = [
    //'id',
    'expand',
    'code',
    'date',
    'debitTotal',
    'creditTotal',
    'comments',
    'actions'
  ];

  snackBar: any;
  private _dialogService: any;

  ngOnInit(): void {
    this.getJournalVouchers();

    // Subscribe to search input changes with debounce
    this.searchInputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchJournalVouchers(true);
    });
  }



  /** Get all journal vouchers */
  getJournalVouchers(): void {
    const queryParams = {
      page: 0,
      size: 10000, // Load all
      sort: 'date,desc',
    };

    this._journalVoucherService.query(queryParams).subscribe((res) => {
      if (res.body) {
        this.allJournals = res.body;
        this.dataSource.data = this.allJournals;
        this.totalItems = this.allJournals.length;
      } else {
        this.allJournals = [];
        this.dataSource.data = [];
      }
      this.noRecord = this.dataSource.data.length === 0;
    });
  }

  searchJournalVouchers(resetPage: boolean = false): void {
    const searchTerm = (this.searchInputControl.value ?? '').trim();

    if (resetPage) {
      this.page = 1;
      if (this._paginator) {
        this._paginator.firstPage();
      }
    }

    if (searchTerm) {
      if (this.searchMode === 'code') {
        this.dataSource.data = this.allJournals.filter(j => j.code && j.code.toLowerCase() === searchTerm.toLowerCase());
      } else {
        this.dataSource.data = this.allJournals.filter(j => j.comments && j.comments.toLowerCase().includes(searchTerm.toLowerCase()));
      }
    } else {
      this.dataSource.data = this.allJournals;
    }

    this.totalItems = this.dataSource.data.length;
    this.noRecord = this.dataSource.data.length === 0;
  }



  setSearchMode(mode: 'code' | 'comments'): void {
    this.searchMode = mode;

    this.searchPlaceholder =
      mode === 'code'
        ? 'Search by Voucher Code'
        : 'Search by Comments';

    // Re-run search if input exists
    if (this.searchInputControl.value) {
      this.searchJournalVouchers(true);
    }
  }

  /** Create new journal voucher */
  createJournalVoucher(): void {
    const dialogRef = this.dialog.open(JournalVoucherCreateComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result && result.created && result.voucherCode) {
        this._snackBarService.open('Journal Voucher Created!', 'Close', { duration: 2500 });

        this.getJournalVouchers();

        // Query server for the created voucher (by code) and then expand it
        this._journalVoucherService.query({
          'code.equals': result.voucherCode,
          size: 1
        }).subscribe((res) => {
          const created = (res.body && res.body[0]) || null;
          if (!created) return;

          // try to find the same instance inside dataSource.data
          const match = this.dataSource.data.find(v => v.code === created.code);
          if (match) {
            this.expandedVoucher = match;
          } else {
            // fallback to the created object if find failed
            this.expandedVoucher = created;
          }

          // load entries
          this._accountsService.query({ 'code.equals': created.code, size: 1000 }).subscribe(
            accRes => this.expandedEntries = accRes.body || []
          );

        }, (err) => {
          console.error('Failed to find created voucher:', err);
        });

        return;
      }

      if (result === true) {
        this._snackBarService.open('Journal Voucher Created!', 'Close', { duration: 2500 });
        this.getJournalVouchers();
      }
    });
  }

  /** Delete journal voucher */
  deleteJournalVoucher(journalVoucher: IJournalVoucher): void {
    const confirmation = confirm(`Are you sure you want to delete journal voucher ${journalVoucher.code}?`);

    if (confirmation) {
      this._journalVoucherService.delete(journalVoucher.id).subscribe({
        next: () => {
          this._snackBarService.open('Journal voucher deleted successfully', 'Close', {
            duration: 3000,
          });
          this.getJournalVouchers();
        },
        error: (error) => {
          console.error('Error deleting journal voucher:', error);
          this._snackBarService.open('Failed to delete journal voucher', 'Close', {
            duration: 3000,
          });
        }
      });
    }
  }
  viewJournalVoucher(voucher: any): void {
    this.dialog.open(JournalVoucherViewComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { id: voucher.id }
    });
  }


  /** Export to Excel/PDF */
  exportJournalVouchers(format: 'excel' | 'pdf'): void {
    // Implement export functionality
    this._snackBarService.open(`${format.toUpperCase()} export feature coming soon`, 'Close', {
      duration: 3000,
    });
  }

  /** Format date for display */
  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY');
  }

  /** Format currency for display */
  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '0.00';
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  refreshFilters(): void {
    this.searchInputControl.setValue('');
    this.searchMode = 'code';
    this.searchPlaceholder = 'Search by Voucher Code';
    this.getJournalVouchers()
  }

  toggleExpand(voucher: any): void {
    if (this.expandedVoucher === voucher) {
      this.expandedVoucher = null;
      this.expandedEntries = [];
      return;
    }

    this.expandedVoucher = voucher;

    this._accountsService.query({
      'code.equals': voucher.code,
      size: 1000
    }).subscribe(res => {
      // IMPORTANT: reset first
      this.expandedEntries = res.body || [];
    });
  }

  extractComment(lmu: string): string {
    if (!lmu) return '';
    const parts = lmu.split('-');
    return parts.length > 2 ? parts[2] : '-';
  }

  getEntriesForVoucher(voucher: any): any[] {
    if (!voucher || !this.expandedEntries.length) {
      return [];
    }

    return this.expandedEntries.filter(entry =>
      entry.code === voucher.code   // or entry.voucherId === voucher.id
    );
  }


}