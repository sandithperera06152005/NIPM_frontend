import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { SupplierBankAccountsService } from 'app/entities/inventorymicro/supplier-bank-accounts/service/supplier-bank-accounts.service';
import { SupplierBankService } from 'app/entities/inventorymicro/supplier-bank/service/supplier-bank.service';
import { SupplierService } from 'app/entities/inventorymicro/supplier/service/supplier.service';
import { ISupplier } from 'app/entities/inventorymicro/supplier/supplier.model';
import { SupplierCreateComponent } from '../admin/supplier-create/supplier-create.component';
import { SupplierviewComponent } from '../admin/supplierview/supplierview/supplierview.component';
import { AccountService } from 'app/core/auth/account.service';
import { AccountsService } from 'app/entities/financemicro/accounts/service/accounts.service';
import { IAccounts } from 'app/entities/financemicro/accounts/accounts.model';
import { AccountsCreateComponent } from '../admin/accounts-create/accounts-create.component';
<<<<<<< HEAD
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { TransactionService } from 'app/entities/financemicro/transaction/service/transaction.service';
=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca

@Component({
  selector: 'app-accounts',
    standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    RouterModule,
    // Material modules
  MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit{
 supservice = inject(AccountsService);
 supplierbank=inject(SupplierBankAccountsService);
 supplierbankacc=inject(SupplierBankService);
<<<<<<< HEAD
 acctTypeService = inject(AccountTypeService);

=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
   supplier: any[] = [];
   currentPage = 1;
   pageSize = 10;
   totalItems = 0;
   totalPages = 0;
 searchByCode = false;
   // 👇 new filter model to bind to form
   filter = {
     name: '',
     code: ''
   };
<<<<<<< HEAD
  paths: string[] = [];
  filteredPaths: { [id: string]: string[] } = {};

=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
 // Example: define supplierId before using it, or move this code into a method and use a parameter
 // let supplierId = 1; // Replace with actual supplier ID
 // this._dialogService.open(SupplierviewComponent, {
 //   data: { id: supplierId }  // pass just the ID
 // });
  
 
 // Or, move this logic into a method:
 openSupplierViewDialog(supplierId: number): void {
   this._dialogService.open(SupplierviewComponent, {
     data: { id: supplierId }  // pass just the ID
   });
 }
 
 selectedSupplierId: number | null = 3;
 
 toggleDetails(id: number): void {
   this.supplierbankacc.find(id).subscribe({
     next: data => {
       console.log('Bank Account:', data);
       // handle/display data
     },
     error: err => console.error('Bank Account error:', err)
   });
 
   this.supplierbank.find(id).subscribe({
     next: data => {
       console.log('Bank:', data);
     },
     error: err => console.error('Bank error:', err)
   });
 
   this.supservice.find(id).subscribe({
     next: data => {
       console.log('Supplier:', data);
     },
     error: err => console.error('Supplier error:', err)
   });
 }
 
 onPaginateChange(event: PageEvent): void {
   this.pageSize = event.pageSize;
   this.currentPage = event.pageIndex + 1;
   this.loadSuppliers();
 }
 deleteSupplier(id: number): void {
<<<<<<< HEAD

  const confirmation = confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);

  if (confirmation) {
=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
   this.supplierbankacc.delete(id).subscribe({
     next: () => {
       this.supplierbank.delete(id).subscribe({
         next: () => {
           this.supservice.delete(id).subscribe({
             next: () => {
<<<<<<< HEAD
               this._snackBarService.open("Account deleted successfully!", "Close", {
=======
               this._snackBarService.open("Supplier deleted successfully!", "Close", {
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
                 duration: 3000,
               });
               this.loadSuppliers();
             },
             error: err => {
<<<<<<< HEAD
               console.error('Account delete failed', err);
               this._snackBarService.open("Account delete failed", "Close", {
=======
               console.error('Supplier delete failed', err);
               this._snackBarService.open("Supplier delete failed", "Close", {
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
                 duration: 3000,
               });
             }
           });
         },
         error: err => {
           console.error('Supplier bank delete failed', err);
           this._snackBarService.open("Supplier bank delete failed", "Close", {
             duration: 3000,
           });
         }
       });
     },
     error: err => {
       console.error('Supplier bank account delete failed', err);
       this._snackBarService.open("Supplier bank account delete failed", "Close", {
         duration: 3000,
       });
     }
   });
<<<<<<< HEAD
  }
=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
 }
 
 
 itemsPerPage: number = 10;
   ngOnInit(): void {
    this.loadSuppliers();
<<<<<<< HEAD

    this.acctTypeService.query({size:1000}).subscribe(res => {
  this.paths = res.body?.map(c => c.lmu) || [];
});

=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
   }
   showId = false;  // or true, depending on when you want to show the id column
 
 get displayedColumns(): string[] {
   const cols = [
     // columns that always show
     'code',
     'vehicleOwnerName',
     'vehicleBrand',
<<<<<<< HEAD
     'vehicleBrand1',
     'vehicleBrand2',
     'vehicleModel',
     'vehicleBrand3',
       'vehicleBrand4',
        'vehicleBrand5',
      'actions',
     
=======
    
     'vehicleBrand2',
      'vehicleBrand3',
       'vehicleBrand4',
        'vehicleBrand5',
     'vehicleModel'
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
   ];
 
   if (this.showId) {
     cols.unshift('id');  // add 'id' column at the start if needed
   }
 
   return cols;
 }
 
   constructor(
     
     private _dialogService: MatDialog,
<<<<<<< HEAD
     private _snackBarService: MatSnackBar,
     private transactionService: TransactionService 

=======
     private _snackBarService: MatSnackBar
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
   ) {
     
   }
   openVehicleCreateDialog(): void {
     const dialogRef = this._dialogService.open(AccountsCreateComponent , {
       width: "80vh",
       maxHeight: "95vh",
     });
 
     dialogRef.afterClosed().subscribe((response) => {
       if (response) {
         this._snackBarService.open("Supplier Created Successfully!", "Close", {
           duration: 3000,
         });
         this.loadSuppliers();
       }
     });
   }
   
 viewopenSupplierViewDialog(supplierId: number): void {
   this._dialogService.open(SupplierviewComponent, {
   data: { id: supplierId }  // pass just the ID
 });}
 onFilterChange(): void {
   this.currentPage = 1;  // Reset to first page
   this.loadSuppliers();
 }
 clearSearchAndReload() {
   if (this.searchByCode) {
     this.filter.code = '';
   } else {
     this.filter.name = '';
   }
   this.loadSuppliers();
 }
 
   loadSuppliers(): void {
<<<<<<< HEAD
  const params: any = {
    page: this.currentPage - 1,
    size: this.pageSize,
    sort:'id,desc'
  };

  if (this.filter.name.trim()) {
    params['name.contains'] = this.filter.name.trim();
  }

  if (this.filter.code.trim()) {
    params['code.contains'] = this.filter.code.trim();
  }

  this.supservice.query(params).subscribe({
    next: response => {
      this.supplier = response.body || [];
      
      // Initialize filteredPaths for each row
      this.supplier.forEach(row => {
        if (!this.filteredPaths[row.id]) {
          this.filteredPaths[row.id] = [...this.paths];
        }
      });
      
      const total = response.headers.get('X-Total-Count');
      this.totalItems = total ? +total : 0;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    },
    error: err => {
      console.error('Error fetching supplier data:', err);
    },
  });
}
=======
     const params: any = {
       page: this.currentPage - 1,
       size: this.pageSize,
       sort:'id,desc'
     };
 
     if (this.filter.name.trim()) {
       params['name.contains'] = this.filter.name.trim();
     }
 
     if (this.filter.code.trim()) {
       params['code.contains'] = this.filter.code.trim();
     }
 
     this.supservice.query(params).subscribe({
       next: response => {
         this.supplier = response.body || [];
         const total = response.headers.get('X-Total-Count');
         this.totalItems = total ? +total : 0;
         this.totalPages = Math.ceil(this.totalItems / this.pageSize);
       },
       error: err => {
         console.error('Error fetching supplier data:', err);
       },
     });
   }
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
 
   goToPage(page: number): void {
     if (page >= 1 && page <= this.totalPages) {
       this.currentPage = page;
       this.loadSuppliers();
     }
   }
 
   nextPage(): void {
     this.goToPage(this.currentPage + 1);
   }
 
   previousPage(): void {
     this.goToPage(this.currentPage - 1);
   }
 
   // Called by "Load Suppliers" button
   onSearch(): void {
     this.currentPage = 1;
     this.loadSuppliers();
   }
 
   // Optional if you want to act on dropdown change immediately
   onRowCountChange(): void {
     this.currentPage = 1;
     this.loadSuppliers();
   }
 
   viewSupplier(supplier: ISupplier): void {
     // Navigate or show modal — customize as needed
     console.log('Viewing supplier:', supplier);
   }
<<<<<<< HEAD

   updatePath(row: any) {
  this.supservice.update(row).subscribe({
    next: (response) => {
      // Record transaction after successful update
      //this.recordTransaction(row, 'UPDATE');
    },
    error: (error) => {
      console.error('Error updating account:', error);
    }
  });
}

filterPathOptions(row: any) {
  const value = (row.path || '').toLowerCase();
  
  // Ensure filteredPaths has an entry for this row
  if (!this.filteredPaths[row.id]) {
    this.filteredPaths[row.id] = [];
  }
  
  // Filter paths based on input
  this.filteredPaths[row.id] = this.paths.filter(p =>
    p.toLowerCase().includes(value)
  );
}
getFilteredPaths(row: any): string[] {
  return this.filteredPaths[row.id] || this.paths;
}

// private recordTransaction(account: any, action: string): void {
//   const transactionData: any = {
//     id: null,
//     accountCode: account.code,
//     debit: account.debitAmount || 0,
//     credit: account.creditAmount || 0,
//     date: new Date().toISOString(),
//     refDoc: account.name,
//     source: account.parent
//   };

//   // Make sure you have TransactionService injected
//   this.transactionService.create(transactionData).subscribe({
//     next: (response) => {
//       console.log('Transaction recorded successfully for', action);
//     },
//     error: (error) => {
//       console.error('Error recording transaction:', error);
//     }
//   });
// }

=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
}
