import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { BankAccountService } from 'app/entities/financemicro/bank-account/service/bank-account.service';
import { IBankAccount } from 'app/entities/financemicro/bank-account/bank-account.model';
import { BankCreateAccountComponent } from '../bank-create-account/bank-create-account.component';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    RouterModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss']
})
export class BankAccountsComponent implements OnInit, AfterViewInit {

  bankService = inject(BankAccountService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  bankAccounts: MatTableDataSource<IBankAccount> = new MatTableDataSource();

  searchMode: 'accountNumber' | 'accountName' | 'bankName' = 'accountNumber';
  searchText: string = '';


  // filter = {
  //   search: '',
  //   accountNumber: '',   
  //   dateRange: { start: null as Date | null, end: null as Date | null }
  // };

  displayedColumns: string[] = [
    'accountNumber',
    'accountName',
    'bankName',
    'branchName',
    'amount',
    'accountCode',
    'accountTypeId',
    'actions'
  ];

  ngOnInit(): void {
    this.bankAccounts.filterPredicate = (data: IBankAccount, filter: string) => {
      if (!filter) return true;
      const value = filter.toLowerCase();
      switch (this.searchMode) {
        case 'accountNumber':
          return data.accountNumber?.toLowerCase().includes(value) || false;
        case 'accountName':
          return data.accountName?.toLowerCase().includes(value) || false;
        case 'bankName':
          return data.bankName?.toLowerCase().includes(value) || false;
        default:
          return true;
      }
    };
    this.loadBankAccounts();
  }

  ngAfterViewInit(): void {
    this.bankAccounts.sort = this.sort;
    this.bankAccounts.paginator = this.paginator;
  }

  loadBankAccounts(): void {
    const params: any = {
      page: 0,
      size: 10000,
      sort: 'id,desc'
    };

    this.bankService.query(params).subscribe({
      next: res => {
        this.bankAccounts.data = res.body || [];
      },
      error: err => console.error('Error fetching bank accounts:', err)
    });
  }


  setSearchMode(mode: 'accountNumber' | 'accountName' | 'bankName'): void {
    if (this.searchMode !== mode) {
      this.searchMode = mode;
      this.bankAccounts.filter = this.searchText || '';
    }
  }


  getSearchPlaceholder(): string {
    switch (this.searchMode) {
      case 'accountNumber':
        return 'Search by Account Number...';
      case 'accountName':
        return 'Search by Account Name...';
      case 'bankName':
        return 'Search by Bank Name...';
      default:
        return 'Search...';
    }
  }


  clearFilters(): void {
    this.searchMode = 'accountNumber';
    this.searchText = '';
    this.bankAccounts.filter = '';
  }



  createAccount(): void {
    const dialogRef = this.dialog.open(BankCreateAccountComponent, {
      width: '550px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadBankAccounts();
        this.snackBar.open('Bank Account Created!', 'Close', { duration: 2500 });
      }
    });
  }



  editAccount(account: IBankAccount): void {
    this.router.navigate(['/bank-accounts', account.id, 'edit']);
  }

  deleteAccount(id: number): void {

    const isConfirmed = window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.');

    if (isConfirmed) {
      this.bankService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Bank account deleted!', 'Close', { duration: 3000 });
          this.loadBankAccounts();
        },
        error: () => {
          this.snackBar.open('Delete failed!', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Deletion cancelled', 'Close', { duration: 2000 });
    }
  }

  onSearch(): void {
    this.bankAccounts.filter = this.searchText || '';
  }

}
