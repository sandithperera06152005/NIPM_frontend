import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild, inject } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { IInvoice } from "app/entities/operationsModuleCooperation/invoice/invoice.model";
import { InvoiceService } from "app/entities/operationsModuleCooperation/invoice/service/invoice.service";

import { MatDialog } from '@angular/material/dialog';
import { CustomerAddPaymentsComponent } from '../customer-Addpayments/customer-Addpayments.component';

// Extend the IInvoice interface locally
interface IInvoiceWithAmount extends IInvoice {
  enteredAmount?: number;
}

@Component({
  selector: "app-customer-payments",
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
  ],
  templateUrl: "./customer-payments.component.html",
  styleUrls: ["./customer-payments.component.scss"],
})
export class CustomerPaymentsComponent implements OnInit {

  searchMode: 'invoiceNumber' | 'vehicleLicenseNumber' | 'vehicleOwnerName' = 'invoiceNumber';
  searchPlaceholder: string = 'Search by Invoice Number';

  private _dialog = inject(MatDialog);

  @ViewChild(MatPaginator) _paginator: MatPaginator;
  dataSource = new MatTableDataSource<IInvoiceWithAmount>([]); // Use the extended interface
  searchInputControl = new FormControl();
  noRecord = false;
  showClear = false;

  itemsPerPage = 10;
  totalItems = 0;
  page = 1;

  private _invoiceService = inject(InvoiceService);
  private _router = inject(Router);
  private _snackBarService = inject(MatSnackBar);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  displayedColumns: string[] = [
    "id",
    "invoiceNumber",
    "vehicleLicenseNumber",
    "vehicleOwnerName",
    "totalNetAmount",
    "invoiceDate",
    "invoiceStatus",
    "paymentAmount",
    "action1",
  ];

  ngOnInit(): void {
    this.getUnpaidInvoices();
  }

  ngAfterViewInit() {
    this._paginator.page.subscribe(() => {
      this.page = this._paginator.pageIndex + 1;
      this.itemsPerPage = this._paginator.pageSize;
      this.getUnpaidInvoices();
    });
  }

  /** Get only unpaid invoices */
  getUnpaidInvoices(): void {
    const queryParams = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: "createdDate,desc",
      "invoiceStatus.equals": "UNPAID",
    };

    this._invoiceService.query(queryParams).subscribe((res) => {
      if (res.body) {
        // Initialize enteredAmount for each invoice
        const invoices: IInvoiceWithAmount[] = res.body.map(invoice => ({
          ...invoice,
          enteredAmount: 0 // Initialize with 0
        }));

        // Check for updated local data (partially/fully paid)
      const localData = localStorage.getItem('updatedInvoices');
      if (localData) {
        const updatedInvoices = JSON.parse(localData);

        // Replace or remove based on payment status
        updatedInvoices.forEach(updated => {
          const index = invoices.findIndex(inv => inv.invoiceNumber === updated.invoiceNumber);

          if (index !== -1) {
            if (updated.totalNetAmount === 0 || updated.invoiceStatus === 'PAID') {
              // Remove fully paid invoice
              invoices.splice(index, 1);
            } else {
              // Update partially paid invoice
              invoices[index].totalNetAmount = updated.totalNetAmount;
            }
          }
        });
      }

        this.dataSource.data = invoices;
        this.totalItems = Number(res.headers.get("X-Total-Count"));
      } else {
        this.dataSource.data = [];
      }
      this.noRecord = this.dataSource.data.length === 0;
    });
  }

  /**  Search unpaid invoices */
  searchInvoices(): void {
    const searchTerm = this.searchInputControl.value?.trim();

    if (!searchTerm) {
      this.getUnpaidInvoices();
      return;
    }

    const params: any = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: "createdDate,desc",
      "invoiceStatus.equals": "UNPAID",
    };

    // search filter based on selected mode
    params[`${this.searchMode}.contains`] = searchTerm;

    this._invoiceService.query(params).subscribe((res) => {
      this.totalItems = Number(res.headers.get("X-Total-Count"));
      const invoices: IInvoiceWithAmount[] = res.body?.map(invoice => ({
        ...invoice,
        enteredAmount: 0
      })) || [];
      this.dataSource.data = invoices;
      this.noRecord = this.dataSource.data.length === 0;
    });
  }

  setSearchMode(mode: 'invoiceNumber' | 'vehicleLicenseNumber' | 'vehicleOwnerName'): void {
    this.searchMode = mode;

    switch (mode) {
      case 'invoiceNumber':
        this.searchPlaceholder = 'Search by Invoice Number';
        break;
      case 'vehicleLicenseNumber':
        this.searchPlaceholder = 'Search by Vehicle Number';
        break;
      case 'vehicleOwnerName':
        this.searchPlaceholder = 'Search by Owner Name';
        break;
    }

    // Optional: clear previous search input when switching mode
    this.searchInputControl.setValue('');
  }

  onAddAmountClick(): void {
  // Get all invoices that have entered amounts > 0
  const invoicesWithAmounts = this.dataSource.data.filter(invoice => 
    invoice.enteredAmount && invoice.enteredAmount > 0
  );

  if (invoicesWithAmounts.length === 0) {
    alert('Please enter amounts for at least one invoice before clicking "Add Amount"');
    return;
  }

  // Open dialog with all selected invoices
  const dialogRef = this._dialog.open(CustomerAddPaymentsComponent, {
    width: '800px',
    disableClose: true,
    data: { invoices: invoicesWithAmounts }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Loop through invoices and update list based on payment settlement
      this.dataSource.data = this.dataSource.data
        .map(invoice => {
          if (invoice.enteredAmount && invoice.enteredAmount > 0) {
            // If fully settled, remove from list
            if (invoice.enteredAmount >= invoice.totalNetAmount) { 
              return null; 
            } else {
              // Update remaining due balance
              return {
                ...invoice,
                totalNetAmount: invoice.totalNetAmount - invoice.enteredAmount, 
                enteredAmount: 0 
              };
            }
          }
          return invoice;
        })
        .filter((invoice): invoice is IInvoiceWithAmount => invoice !== null);
    }
  });
}

/** View invoice in read-only mode */
viewInvoice(invoice: IInvoiceWithAmount): void {
  this._router.navigate(["/invoices-view", invoice.id], {
    queryParams: { mode: 'view' }
  });
}
  refreshFilters(): void {
    //this.filter = { code: '', name: '', dateRange: { start: null, end: null } };
    this.getUnpaidInvoices();
  }
  

}