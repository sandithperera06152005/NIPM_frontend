import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GRNService } from 'app/entities/inventorymicro/grn/service/grn.service';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VendorAddPaymentsComponent } from '../vendor-Addpayments/vendor-Addpayments.component';

@Component({
  selector: 'app-vendor-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './vendor-payments.component.html',
  styleUrl: './vendor-payments.component.scss'
})
export class VendorPaymentsComponent {
  grnService = inject(GRNService);
  snackBar = inject(MatSnackBar);
    dialog = inject(MatDialog);

  dataSource: any[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  searchMode: string = 'grnCode';
  searchInputControl = new FormControl('');
  searchPlaceholder = 'Search by GRN No';

  displayedColumns: string[] = [
    'id', 
    'grnCode', 
    'supplierName', 
    'supplierInvoiceCode', 
    'supplierInvoiceDate', 
    'amountInitial',
    'amountOwing',
    'paymentAmount', 
    //'actions'
];

  ngOnInit(): void {
    this.loadNotPaidGRNs();
  }


loadNotPaidGRNs(): void {
  const params: any = {
    'inspected.equals': false,
    page: this.currentPage - 1,
    size: this.pageSize,
    sort: 'id,desc'
  };

  const searchValue = this.searchInputControl.value?.trim();
  if (searchValue) {
    if (this.searchMode === 'grnCode') params['grnCode.contains'] = searchValue;
    else if (this.searchMode === 'supplierName') params['supplierName.contains'] = searchValue;
    else if (this.searchMode === 'supplierInvoiceCode') params['supplierInvoiceCode.contains'] = searchValue;
  }

  this.grnService.query(params).subscribe({
    next: response => {
      // Get stored initial amounts from localStorage
      const storedInitialAmounts = JSON.parse(localStorage.getItem('grnInitialAmounts') || '{}');
      
      this.dataSource = (response.body || []).map(grn => {
        // If we don't have an initial amount stored for this GRN, store it
        if (!storedInitialAmounts[grn.id]) {
          storedInitialAmounts[grn.id] = grn.amountOwing;
          localStorage.setItem('grnInitialAmounts', JSON.stringify(storedInitialAmounts));
        }
        
        return {
          ...grn,
          amountInitial: storedInitialAmounts[grn.id], // Use stored initial amount
          enteredAmount: 0
        };
      });
      const total = response.headers.get('X-Total-Count');
      this.totalItems = total ? +total : 0;
    },
    error: err => console.error('Error fetching unpaid GRNs:', err)
  });
}

  onPaginateChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadNotPaidGRNs();
  }

  setSearchMode(mode: string): void {
    this.searchMode = mode;
    switch (mode) {
      case 'grnCode':
        this.searchPlaceholder = 'Search by GRN No';
        break;
      case 'supplierName':
        this.searchPlaceholder = 'Search by Supplier Name';
        break;
      case 'supplierInvoiceCode':
        this.searchPlaceholder = 'Search by Invoice Code';
        break;
    }
    this.searchInputControl.setValue('');
    this.loadNotPaidGRNs();
  }

  searchInvoices(): void {
    this.currentPage = 1;
    this.loadNotPaidGRNs();
  }

  refreshFilters(): void {
    this.searchInputControl.setValue('');
    this.loadNotPaidGRNs();
  }

  markAsPaid(id: number): void {
    this.grnService.partialUpdate({ id, inspected: true }).subscribe({
      next: () => {
        this.snackBar.open('Marked as Paid', 'Close', { duration: 2000 });
        this.loadNotPaidGRNs();
      },
      error: err => console.error('Error marking as paid:', err)
    });
  }
  
  onAddAmountClick(): void {
    const selectedGRNs = this.dataSource.filter(g => g.enteredAmount && g.enteredAmount > 0);

    if (selectedGRNs.length === 0) {
      this.snackBar.open('Please enter payment amounts before proceeding.', 'Close', { duration: 2000 });
      return;
    }

    const invalidGRNs = selectedGRNs.filter(g => g.enteredAmount > g.amountOwing);

    if (invalidGRNs.length > 0) {
    this.snackBar.open('Payment amount cannot exceed owing amount.', 'Close', { duration: 3000 });
    return;
  }

    const dialogRef = this.dialog.open(VendorAddPaymentsComponent, {
      width: '800px',
      maxWidth: '1000px',
      data: { grns: selectedGRNs },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.loadNotPaidGRNs(); // reload table after payment
      }
    });

  }




}
