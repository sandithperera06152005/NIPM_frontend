import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
import { MatAutocompleteModule  } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-account-subcreate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule 
  ],
  templateUrl: './accounttree-subcreate.component.html',
  styleUrls: ['./accounttree-subcreate.component.scss']
})
export class AccountSubcreateComponent implements OnInit {
  categoryService = inject(AccountTypeService);

  subAccountForm: FormGroup;
  categories: any[] = [];
  fullPathPreview: string = '';
  filteredParentOptions!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AccountSubcreateComponent>,
    public _snackBarService: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { parent?: any }
  ) {
    this.subAccountForm = this.fb.group({
      name: ['', Validators.required],
      parentAccount: [null, Validators.required],
      subcode: ['', Validators.required] 
    });
  }

  private getTopCategoryKey(parent: any): string {
  const raw = (parent?.lmu ?? '').toString(); // lmu is your full path (e.g., Income/Salary)
  const top = raw.split('/')[0]?.trim() ?? ''; // Take "Income"
  return top.toLowerCase(); // Return lowercase
}

ngOnInit(): void {
  this.fetchCategories();

  if (this.data?.parent) {
    this.subAccountForm.patchValue({ parentAccount: this.data.parent });
  }

  // Always keep full path preview updated
  this.subAccountForm.valueChanges.subscribe(() => {
    this.fullPathPreview = this.computeFullPath();
  });

  //  Ensure prefix when parent changes
  this.subAccountForm.get('parentAccount')?.valueChanges.subscribe(parent => {
    const prefix = this.prefixMap[this.getTopCategoryKey(parent)] ?? '';
    const current = this.subAccountForm.get('subcode')?.value ?? '';

    // Reset subcode with prefix if empty or wrong
    if (prefix && !current.startsWith(prefix)) {
      this.subAccountForm.patchValue({ subcode: prefix }, { emitEvent: false });
    }
  });

  //  Ensure prefix stays even if user edits/deletes
  this.subAccountForm.get('subcode')?.valueChanges.subscribe(value => {
    const parent = this.subAccountForm.get('parentAccount')?.value;
    const prefix = this.prefixMap[this.getTopCategoryKey(parent)] ?? '';
    const current = (value ?? '').toString();

    if (prefix && !current.startsWith(prefix)) {
      this.subAccountForm.patchValue({ subcode: prefix + current.replace(prefix, '') }, { emitEvent: false });
    }
  });
}

  displayCategory(category: any): string {
    return category && category.lmu ? category.lmu : '';
  }

fetchCategories() {
  this.categoryService.query({size:1000}).subscribe({
    next: (res) => {
      this.categories = res.body || [];
      
      // Set up filtered options
      this.filteredParentOptions = this.subAccountForm.controls.parentAccount.valueChanges.pipe(
        startWith(''),
        map(value => this._filterParentAccounts(value))
      );
    },
    error: (err) => {
      console.error('Failed to fetch categories:', err);
    }
  });
}

private _filterParentAccounts(value: string | any): any[] {
  const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.lmu?.toLowerCase() || '';
  return this.categories.filter(cat => 
    cat.lmu?.toLowerCase().includes(filterValue)
  );
}

  computeFullPath(): string {
    const parent = this.subAccountForm.controls.parentAccount.value;
    const name = this.subAccountForm.controls.name.value || '';

    if (parent && parent.lmu) {
      return `${parent.lmu}/${name}`;
    }
    return name;
  }

  itemsave(): void {
    let fullPath = this.computeFullPath().replace(/\/+/g, '/');

    if (fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
    }

    if (fullPath.startsWith('/')) {
      fullPath = fullPath.slice(1);
    }

    const payload = {
      id: null,
      type: this.subAccountForm.value.parentAccount.type,
      lmu: fullPath,
      code: this.subAccountForm.value.subcode
    };

    this.categoryService.create(payload).subscribe({
      next: () => {
        this._snackBarService.open("Sub account created successfully!", "Close", {
          duration: 3000,
        });
        this.dialogRef.close(true);
        window.location.reload();
      },
      error: (err) => {
        console.error('Error creating sub account:', err);
      }
    });
  }

  onSave(): void {
    if (this.subAccountForm.valid) {
      this.itemsave();
    } else {
      console.warn('Sub account form is invalid');
    }
  }

onParentChange(parent: any) {
  this.fullPathPreview = this.computeFullPath();

  const prefix = this.prefixMap[this.getTopCategoryKey(parent)] ?? '';
  if (prefix) {
    this.subAccountForm.patchValue({ subcode: prefix }, { emitEvent: false });
  }
}


  // Add this in your component class
// Case-insensitive prefix map
prefixMap: Record<string, string> = {
  asset: '   AS-',
  liability: '   LI-',
  equity: '   EQ-',
  income: '   IN-',
  expense: '   EX-'
};


}
