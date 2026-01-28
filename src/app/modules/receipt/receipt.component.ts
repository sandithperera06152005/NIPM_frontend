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
import { ReceiptService } from 'app/entities/financemicro/receipt/service/receipt.service';
import { IReceipt } from 'app/entities/financemicro/receipt/receipt.model';
import { ReceiptCreateComponent } from '../receipt-create/receipt-create.component';
import { ReceiptViewComponent } from '../receipt-view/receipt-view.component';

@Component({
  selector: 'app-receipt',
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
    ReceiptCreateComponent,
  ],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
})
export class ReceiptComponent implements OnInit {
  receipts: IReceipt[] = [];
  uniqueReceipts: IReceipt[] = []; // This will store unique receipts
  displayedColumns: string[] = [
    'id',
    'code',
    'totalAmount',
    //'paymentMethod',
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
    private receiptService: ReceiptService,
    private dialog: MatDialog,
    private _snackBarService: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  // Method to group receipts by code and get unique entries
  private getUniqueReceipts(receipts: IReceipt[]): IReceipt[] {
    const uniqueMap = new Map<string, IReceipt>();
    
    receipts.forEach(receipt => {
      if (receipt.code && !uniqueMap.has(receipt.code)) {
        uniqueMap.set(receipt.code, receipt);
      }
    });
    
    return Array.from(uniqueMap.values());
  }

  loadReceipts(): void {
    const params = {
      page: this.currentPage - 1,
      size: this.pageSize,
      sort: ['id,desc'],
    };

    this.receiptService.query(params).subscribe({
      next: (response) => {
        const allReceipts = response.body ?? [];
        
        // Get unique receipts by code
        this.uniqueReceipts = this.getUniqueReceipts(allReceipts);
        
        // For backward compatibility, keep the original array
        this.receipts = allReceipts;
        
        this.totalItems = Number(response.headers.get('X-Total-Count')) || 0;
      },
      error: (err) => console.error('Error fetching receipts:', err),
    });
  }

  // Update the table to use uniqueReceipts instead of receipts
  // In your template, change [dataSource]="receipts" to [dataSource]="uniqueReceipts"

openVehicleCreateDialog(): void {
  const dialogRef = this.dialog.open(ReceiptCreateComponent, {
    width: '80vh',
    maxHeight: '95vh',
  });
  
  dialogRef.afterClosed().subscribe((createdReceipt: IReceipt) => {
    if (createdReceipt) {
      // Immediately add to local arrays for instant UI update
      this.receipts = [createdReceipt, ...this.receipts];
      this.uniqueReceipts = this.getUniqueReceipts(this.receipts);
      
      // Show success message
      this._snackBarService.open('Receipt Created Successfully!', 'Close', { duration: 3000 });
      
      // Optional: Reload from server after delay to ensure data consistency
      setTimeout(() => {
        this.loadReceipts();
      }, 1000);
    }
  });
}

  viewReceipt(receiptId: number): void {
    this.dialog.open(ReceiptViewComponent, {
      width: '800px',
      data: { id: receiptId },
    });
  }

  deleteReceipt(id: number): void {
    if (confirm('Are you sure you want to delete this receipt?')) {
      this.receiptService.delete(id).subscribe({
        next: () => {
          this.receipts = this.receipts.filter(r => r.id !== id);
          this.uniqueReceipts = this.getUniqueReceipts(this.receipts);
          this._snackBarService.open('Receipt deleted successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: err => {
          console.error('Error deleting receipt:', err);
          this._snackBarService.open('Failed to delete receipt', 'Close', {
            duration: 3000,
          });
        }
      });
    }
  }

  // Other methods remain the same...
  loadSuppliers() {
    throw new Error('Method not implemented.');
  }

onFilterChange(): void {
  this.currentPage = 1; // Reset to first page
  
  const params: any = {
    page: this.currentPage - 1,
    size: this.pageSize,
    sort: ['id,desc'],
  };

  // Add search filters based on current selection
  if (this.searchByCode && this.filter.code) {
    params['code.contains'] = this.filter.code;
  } else if (!this.searchByCode && this.filter.name) {
    params['customerName.contains'] = this.filter.name;
  }

  // Add date range filter if available
  if (this.filter.dateRange.start && this.filter.dateRange.end) {
    params['receiptDate.greaterThanOrEqual'] = this.filter.dateRange.start;
    params['receiptDate.lessThanOrEqual'] = this.filter.dateRange.end;
  }

  this.loadReceiptsWithParams(params);
}

// Separate model for what's shown inside the input
codeInput: string = '';

onCodeChange(value: string): void {
  if (this.searchByCode) {
    // User types only the suffix, no need to keep RCPT in input
    this.codeInput = value.replace(/^RCPT/i, '');
    this.filter.code = 'RCPT' + this.codeInput; // store full code
  } else {
    this.filter.name = value;
  }
}

onCodeFocus(): void {
  if (this.searchByCode) {
    // Show RCPT prefix inside the input immediately on focus
    if (!this.codeInput) {
      this.codeInput = ''; // cursor stays after RCPT
    }
  }
}


private loadReceiptsWithParams(params: any): void {
  this.receiptService.query(params).subscribe({
    next: (response) => {
      const allReceipts = response.body ?? [];
      this.uniqueReceipts = this.getUniqueReceipts(allReceipts);
      this.receipts = allReceipts;
      this.totalItems = Number(response.headers.get('X-Total-Count')) || this.uniqueReceipts.length;
    },
    error: (err) => console.error('Error fetching receipts:', err),
  });
}

  refreshFilters(): void {
    this.filter = { code: '', name: '', dateRange: { start: null, end: null } };
    this.loadReceipts();
  }

  onDateChange(): void {
    console.log('Date range changed:', this.filter.receiptDate);
    this.loadReceipts();
  }

  onPaginateChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadReceipts();
  }

  onAddMore(): void {
    console.log('Generate day-end report clicked');
  }
}