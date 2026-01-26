import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CategoryService } from 'app/entities/inventorymicro/category/service/category.service';
import { SupplierBankAccountsService } from 'app/entities/inventorymicro/supplier-bank-accounts/service/supplier-bank-accounts.service';
import { SupplierBankService } from 'app/entities/inventorymicro/supplier-bank/service/supplier-bank.service';
import { SupplierService } from 'app/entities/inventorymicro/supplier/service/supplier.service';
import { ISupplier } from 'app/entities/inventorymicro/supplier/supplier.model';
import { CategoryCreateComponent } from '../admin/category-create/category-create.component';
import { SupplierviewComponent } from '../admin/supplierview/supplierview/supplierview.component';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { IAccountType } from 'app/entities/financemicro/account-type/account-type.model';
import { AccounttreeCreateComponent } from '../admin/accounttree-create/accounttree-create.component';
<<<<<<< HEAD
import { AccountSubcreateComponent } from '../admin/accounttree-subCreate/accounttree-subCreate.component';
import { AccounttreeViewComponent } from '../account-tree-view/accounttree-view.component';


@Component({
  selector: 'app-accounttree',
  standalone: true,
  imports: [CommonModule,
=======

@Component({
  selector: 'app-accounttree',
   standalone: true,
    imports: [ CommonModule,
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
    FormsModule,
    NgFor,
    NgIf,
    RouterModule,
    // Material modules
<<<<<<< HEAD
    MatPaginatorModule,
=======
  MatPaginatorModule,
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,],
  templateUrl: './accounttree.component.html',
  styleUrl: './accounttree.component.scss'
})
export class AccounttreeComponent {
<<<<<<< HEAD
  category = inject(AccountTypeService);
  supservice = inject(SupplierService);
  supplierbank = inject(SupplierBankAccountsService);
  supplierbankacc = inject(SupplierBankService);
=======
 category= inject(AccountTypeService);
 supservice = inject(SupplierService);
supplierbank=inject(SupplierBankAccountsService);
supplierbankacc=inject(SupplierBankService);
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
  supplier: IAccountType[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
<<<<<<< HEAD
  searchByCode = false;
=======
searchByCode = false;
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
  // 👇 new filter model to bind to form
  filter = {
    name: '',
    code: ''
  };
<<<<<<< HEAD
  // Example: define supplierId before using it, or move this code into a method and use a parameter
  // let supplierId = 1; // Replace with actual supplier ID
  // this._dialogService.open(SupplierviewComponent, {
  //   data: { id: supplierId }  // pass just the ID
  // });
  @ViewChild(MatPaginator) paginator: MatPaginator;
  editRowId: number | null = null;
  editInputname: string = '';
  editfullPath: string = '';

  enableEdit(suppliers: any): void {
    this.editRowId = suppliers.id;
    this.editInputname = suppliers.name;  // Fix here
    this.editfullPath = suppliers.fullPath;        // Fix here
  }

  getParentName(fullPath: string): string {
    if (!fullPath) return '';

    const parts = fullPath.split('/').filter(part => part.trim() !== '');

    if (parts.length >= 2) {
      // Return second last segment as parent
      return parts[parts.length - 2];
    } else if (parts.length === 1) {
      // If only one segment, parent is same as that segment
      return parts[0];
    }

    return '';
  }


  saveEdit(id: number): void {
    const updatedData = {
      id,
      name: this.editInputname,
      fullPath: this.editfullPath
    };

    this.category.partialUpdate(updatedData).subscribe({
      next: (res) => {
        console.log('Updated successfully:', res);
        this.editRowId = null;
        if (this.paginator) {
          this.paginator.firstPage(); // Resets UI and emits change
        }

        // You may still reset manually if needed
        this.currentPage = 1;

        this.loadSuppliers();
        // Reload or update local table row if needed
      },
      error: (err) => {
        console.error('Error while updating:', err);
      }
    });
  }


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

  openSubAccountDialog(supplier: any) {
    // Example: open a dialog for creating sub-account
    const dialogRef = this._dialogService.open(AccountSubcreateComponent, {
      width: '600px',
      data: { supplier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result (e.g., refresh table, add new row, etc.)
        console.log('Sub account created:', result);
      }
    });
  }

  deleteSupplier(id: number): void {
    const confirmed = confirm("Are you sure you want to delete this account type?");
    if (confirmed) {
      this.category.delete(id).subscribe({
        next: () => {
          this._snackBarService.open("  deleted successfully!", "Close", {
            duration: 3000,
          });
          this.loadSuppliers();
        },
        error: (err) => {
          console.error('Supplier delete failed', err);
          this._snackBarService.open("Supplier delete failed", "Close", {
            duration: 3000,
          });
        }
      });
    }


  }
  deleteSubAccount(subAccountId: number): void {
  const confirmed = confirm("Are you sure you want to delete this sub-account?");
  if (confirmed) {
    this.category.delete(subAccountId).subscribe({
      next: () => {
        this._snackBarService.open("Sub-account deleted successfully!", "Close", { duration: 3000 });
        this.loadSuppliers(); // refresh table
      },
      error: (err) => {
        console.error('Sub-account delete failed', err);
        this._snackBarService.open("Sub-account delete failed", "Close", { duration: 3000 });
      }
    });
  }
}


  refreshFilters(): void {
    // Clear all filter inputs
    this.filter.code = '';
    this.filter.name = '';


    // Reset toggles if needed
    this.searchByCode = true;   // or false, depending on your default


    // Call your existing loadSuppliers() method to reload data
    this.loadSuppliers();
  }


  itemsPerPage: number = 10;
  ngOnInit(): void {
    this.loadSuppliers();
  }


  showId = false;  // or true, depending on when you want to show the id column

  get displayedColumns(): string[] {
    const cols = [
      // columns that always show
      'generatedCode', //auto generated code
      'code',
      'vehicleOwnerName',
      'parentName',
      'action'
    ];

    if (this.showId) {
      cols.unshift('id');  // add 'id' column at the start if needed
    }

    return cols;
  }
  constructor(

    private _dialogService: MatDialog,
    private _snackBarService: MatSnackBar
  ) {

  }
  openVehicleCreateDialog(): void {
    const dialogRef = this._dialogService.open(AccounttreeCreateComponent, {
=======
// Example: define supplierId before using it, or move this code into a method and use a parameter
// let supplierId = 1; // Replace with actual supplier ID
// this._dialogService.open(SupplierviewComponent, {
//   data: { id: supplierId }  // pass just the ID
// });
  @ViewChild(MatPaginator) paginator: MatPaginator;
editRowId: number | null = null;
editInputname: string = '';
editfullPath : string = '';

enableEdit(suppliers: any): void {
  this.editRowId = suppliers.id;
  this.editInputname = suppliers.name;  // Fix here
  this.editfullPath = suppliers.fullPath ;        // Fix here
}

getParentName(fullPath: string): string {
  if (!fullPath) return '';

  const parts = fullPath.split('/').filter(part => part.trim() !== '');

  if (parts.length >= 2) {
    // Return second last segment as parent
    return parts[parts.length - 2];
  } else if (parts.length === 1) {
    // If only one segment, parent is same as that segment
    return parts[0];
  }

  return '';
}


saveEdit(id: number): void {
  const updatedData = {
    id,
    name: this.editInputname,
    fullPath:  this.editfullPath 
  };

  this.category.partialUpdate(updatedData).subscribe({
    next: (res) => {
      console.log('Updated successfully:', res);
      this.editRowId = null;
       if (this.paginator) {
        this.paginator.firstPage(); // Resets UI and emits change
      }

      // You may still reset manually if needed
      this.currentPage = 1;

      this.loadSuppliers();
      // Reload or update local table row if needed
    },
    error: (err) => {
      console.error('Error while updating:', err);
    }
  });
}


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
  this.category.delete(id).subscribe({
    next: () => {
      this._snackBarService.open("  deleted successfully!", "Close", {
        duration: 3000,
      });
      this.loadSuppliers();
    },
    error: (err) => {
      console.error('Supplier delete failed', err);
      this._snackBarService.open("Supplier delete failed", "Close", {
        duration: 3000,
      });
    }
  });
}

refreshFilters(): void {
  // Clear all filter inputs
  this.filter.code = '';
  this.filter.name = '';
  

  // Reset toggles if needed
  this.searchByCode = true;   // or false, depending on your default
  

  // Call your existing loadSuppliers() method to reload data
  this.loadSuppliers();
}


itemsPerPage: number = 10;
  ngOnInit(): void {
   this.loadSuppliers();
  }
 

  showId = false;  // or true, depending on when you want to show the id column

get displayedColumns(): string[] {
  const cols = [
    // columns that always show
    'code',
  
  'vehicleOwnerName',
 'parentName',
 
 
  'action'
  ];

  if (this.showId) {
    cols.unshift('id');  // add 'id' column at the start if needed
  }

  return cols;
}
  constructor(
    
    private _dialogService: MatDialog,
    private _snackBarService: MatSnackBar
  ) {
    
  }
  openVehicleCreateDialog(): void {
    const dialogRef = this._dialogService.open(AccounttreeCreateComponent , {
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
      width: "80vh",
      maxHeight: "95vh",
    });

    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this._snackBarService.open("Supplier Created Successfully!", "Close", {
          duration: 3000,
        });
<<<<<<< HEAD
        this.loadSuppliers(); // ✅ refresh with new generatedCode
      }
    });
  }
  viewopenSupplierViewDialog(supplierId: number): void {
    this._dialogService.open(SupplierviewComponent, {
      data: { id: supplierId }  // pass just the ID
    });
  }
  onFilterChange(): void {
    this.currentPage = 1;  // Reset to first page
    this.loadSuppliers();
  }
=======
        
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
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca

  loadSuppliers(): void {
    const params: any = {
      page: this.currentPage - 1,
      size: this.pageSize,
    };

    if (this.filter.name.trim()) {
      params['code.contains'] = this.filter.name.trim();
    }

    if (this.filter.code.trim()) {
      params['lmu.contains'] = this.filter.code.trim();
    }

    this.category.query(params).subscribe({
      next: response => {
<<<<<<< HEAD
        this.supplier = (response.body || []).map(acc => ({
          ...acc,
          generatedCode: "AC-" + Math.random().toString(36).substring(2, 8).toUpperCase()
        }));
=======
        this.supplier = response.body || [];
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
        const total = response.headers.get('X-Total-Count');
        this.totalItems = total ? +total : 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      },
      error: err => {
        console.error('Error fetching supplier data:', err);
      },
    });
  }

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
  openAccountTreeDialog(): void {
    this._dialogService.open(AccounttreeViewComponent, {
      width: '700px',
      maxHeight: '80vh',
      disableClose: false,
      data: {}
    });
  }
=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
}
