import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { VoucherService } from 'app/entities/financemicro/voucher/service/voucher.service';
import { IVoucher } from 'app/entities/financemicro/voucher/voucher.model';
import { VoucherCreateComponent } from '../voucher-create/voucher-create.component';
import { VoucherViewComponent } from '../voucher-view/voucher-view.component';
//import { VoucherCreateComponent } from '../voucher-create/voucher-create.component';
//import { VoucherViewComponent } from '../voucher-view/voucher-view.component';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    VoucherCreateComponent,
  ],
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss'],
})
export class VoucherComponent implements OnInit {
  vouchers: IVoucher[] = [];
  uniqueVouchers: IVoucher[] = [];
  displayedColumns: string[] = [
    'id',
    'code',
    'totalAmount',
    'actions'
  ];

  searchByCode = true;
  showDateRange = false;
  filter: any = {
    code: '',
    name: '',
    dateRange: { start: null, end: null },
  };
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  constructor(
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private _snackBarService: MatSnackBar
  ) {}

  ngOnInit(): void {
    
    this.loadVouchers();
  }

  private getUniqueVouchers(vouchers: IVoucher[]): IVoucher[] {
    const uniqueMap = new Map<string, IVoucher>();
    vouchers.forEach(voucher => {
      if (voucher.code && !uniqueMap.has(voucher.code)) {
        uniqueMap.set(voucher.code, voucher);
      }
    });
    return Array.from(uniqueMap.values());
  }

loadVouchers(): void {
  const params = {
    page: this.currentPage - 1,  // This should be a NUMBER, not string
    size: this.pageSize,         // This should be a NUMBER, not string
    sort: ['id,desc'],
  };

  console.log('Loading vouchers with params:', params); //debug log
  console.log('Page type:', typeof params.page); // Check if it's number or string

  this.voucherService.query(params).subscribe({
    next: (response) => {
      console.log('API Response received:', response);  //debug log
      const allVouchers = response.body ?? [];
      this.uniqueVouchers = this.getUniqueVouchers(allVouchers);
      this.vouchers = allVouchers;
      this.totalItems = Number(response.headers.get('X-Total-Count')) || 0;
    },
    error: (err) => {
      console.error('Error fetching vouchers:', err);
      console.error('Error URL:', err.url);
      this._snackBarService.open('Failed to load vouchers', 'Close', {
        duration: 3000,
      });
    },
  });
}

  openVoucherCreateDialog(): void {
  const dialogRef = this.dialog.open(VoucherCreateComponent, {
    width: '80vh',
    maxHeight: '95vh',
  });

  dialogRef.afterClosed().subscribe((createdVoucher: IVoucher) => {
    if (createdVoucher) {
      this.vouchers = [createdVoucher, ...this.vouchers];
      this.uniqueVouchers = this.getUniqueVouchers(this.vouchers);

      this._snackBarService.open('Voucher Created Successfully!', 'Close', {
        duration: 3000,
      });

      setTimeout(() => {
        this.loadVouchers();
      }, 1000);
    }
  });
}

  viewVoucher(voucherId: number): void {
    this.dialog.open(VoucherViewComponent, {
      width: '800px',
      data: { id: voucherId },
    });
  }

  deleteVoucher(id: number): void {
    if (confirm('Are you sure you want to delete this voucher?')) {
      this.voucherService.delete(id).subscribe({
        next: () => {
          this.vouchers = this.vouchers.filter(v => v.id !== id);
          this.uniqueVouchers = this.getUniqueVouchers(this.vouchers);
          this._snackBarService.open('Voucher deleted successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: err => {
          console.error('Error deleting voucher:', err);
          this._snackBarService.open('Failed to delete voucher', 'Close', {
            duration: 3000,
          });
        }
      });
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    const params: any = {
      page: this.currentPage - 1,
      size: this.pageSize,
      sort: ['id,desc'],
    };

    if (this.searchByCode && this.filter.code) {
      params['code.contains'] = this.filter.code;
    } else if (!this.searchByCode && this.filter.name) {
      params['customerName.contains'] = this.filter.name;
    }

    if (this.filter.dateRange.start && this.filter.dateRange.end) {
      params['receiptDate.greaterThanOrEqual'] = this.filter.dateRange.start;
      params['receiptDate.lessThanOrEqual'] = this.filter.dateRange.end;
    }

    this.loadVouchersWithParams(params);
  }

  codeInput: string = '';

  onCodeChange(value: string): void {
    if (this.searchByCode) {
      this.codeInput = value.replace(/^VCHR/i, '');
      this.filter.code = 'VCHR' + this.codeInput;
    } else {
      this.filter.name = value;
    }
  }

  onCodeFocus(): void {
    if (this.searchByCode && !this.codeInput) {
      this.codeInput = '';
    }
  }

  private loadVouchersWithParams(params: any): void {
    this.voucherService.query(params).subscribe({
      next: (response) => {
        const allVouchers = response.body ?? [];
        this.uniqueVouchers = this.getUniqueVouchers(allVouchers);
        this.vouchers = allVouchers;
        this.totalItems = Number(response.headers.get('X-Total-Count')) || this.uniqueVouchers.length;
      },
      error: (err) => console.error('Error fetching vouchers:', err),
    });
  }

  refreshFilters(): void {
    this.filter = { code: '', name: '', dateRange: { start: null, end: null } };
    this.loadVouchers();
  }

  onDateChange(): void {
    console.log('Date range changed:', this.filter.receiptDate);
    this.loadVouchers();
  }

  onPaginateChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadVouchers();
  }

  onAddMore(): void {
    console.log('Generate day-end report clicked');
  }
}
