import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { CategoryService } from 'app/entities/inventorymicro/category/service/category.service';
import { InventoryService } from 'app/entities/inventorymicro/inventory/service/inventory.service';
import { Observable, startWith, map } from 'rxjs';
import { CategoryCreateComponent } from '../category-create/category-create.component';
import { AccountTypeService } from 'app/entities/financemicro/account-type/service/account-type.service';
<<<<<<< HEAD
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';


export function accountCodeRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null; // don’t validate empty, let required validator handle it
    }
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return { outOfRange: { min, max } };
    }
    return null;
  };
}

=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca

@Component({
  selector: 'app-accounttree-create',
  standalone: true,
    imports: [
     CommonModule, MatIconModule,
         FormsModule, ReactiveFormsModule,
         MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule,
         MatOptionModule, MatButtonModule, MatCheckboxModule, MatRadioModule,MatAutocompleteModule
    ],
  templateUrl: './accounttree-create.component.html',
  styleUrl: './accounttree-create.component.scss'
})
export class AccounttreeCreateComponent implements OnInit {
  inventoryservice = inject(InventoryService);
  categoryService = inject(AccountTypeService);

  categoryForm: FormGroup;
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AccounttreeCreateComponent>,
    public _snackBarService: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { supplier: any }
  ) {
    this.categoryForm = this.fb.group({
      name: [''],
      parentCategory: [null]  // this will store the selected parent
    });
  }
  parentCategoryControl = new FormControl(null);
  filteredCategories!: Observable<any[]>;
  ngOnInit(): void {
<<<<<<< HEAD

  this.categoryForm.get('parentCategory')?.valueChanges.subscribe((parent) => {
  const nameControl = this.categoryForm.get('name');
  if (!nameControl) return;

  // Clear existing validators
  nameControl.clearValidators();

  let type: string = '';

  if (typeof parent === 'string') {
    type = parent.toLowerCase();
  } else if (parent?.type) {
    type = parent.type.toLowerCase();
  }

  if (type === 'asset') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(1000, 1999),
    ]);
  } else if (type === 'liability') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(2000, 2999),
    ]);
  } else if (type === 'expense') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(3000, 3999),
    ]);
  } else if (type === 'income') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(4000, 4999),
    ]);
  } else if (type === 'equity') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(5000, 5999),
    ]);
  } else if (type === 'equity') {
    nameControl.setValidators([
      Validators.required,
      accountCodeRangeValidator(5000, 5999),
    ]);
  }
  

  nameControl.updateValueAndValidity();
});



=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
  this.fetchCategories();
this.filteredCategories = this.categoryForm.controls.parentCategory.valueChanges.pipe(
  startWith(''),
  map(value => (typeof value === 'string' ? value : value?.lmu)),
  map(name =>
    name
      ? this.categories.filter(cat =>
          cat.lmu.toLowerCase().includes(name.toLowerCase())
        )
      : this.categories.slice()
  )
);

 if (this.data?.supplier) {
  this.categoryForm.patchValue(this.data.supplier);
  // If parentCategory is an object, patch it properly here, e.g.:
  // this.categoryForm.patchValue({ parentCategory: theParentObject });
  this.fullPathPreview = this.computeFullPath();
}


  // 🔁 Watch for form changes and update preview
  this.categoryForm.valueChanges.subscribe(() => {
    this.fullPathPreview = this.computeFullPath();
  });
}
  displayCategory(category: any): string {
    return category && category.lmu ? category.lmu : '';
  }

  onCategorySelected(event: any, selectedCategory: any) {
    if (event.isUserInput) {
      this.parentCategoryControl.setValue(selectedCategory);
    }
  }
  fetchCategories() {
<<<<<<< HEAD
    this.categoryService.query({size: 1000}).subscribe({
=======
    this.categoryService.query().subscribe({
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
      next: (res) => {
        this.categories = res.body || [];
        console.log(this.categories)
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
      }
    });
  }

 computeFullPath(): string {
  const parent = this.categoryForm.controls.parentCategory.value;
  const name = this.categoryForm.controls.name.value || '';
console.log(parent)
<<<<<<< HEAD
if (parent) {
    if (typeof parent === 'object' && parent.lmu) {
      return parent.lmu;   // 👈 only parent path, no account code
    }
    if (typeof parent === 'string' && parent.trim() !== '') {
      return parent.trim(); // 👈 only parent string, no account code
=======
  if (parent) {
    if (typeof parent === 'object' && parent.lmu) {
      return `${parent.lmu}/${name}`;
    }
    if (typeof parent === 'string' && parent.trim() !== '') {
      console.log('tis works')
      return `${parent.trim()}/${name}`;
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
    }
  }

  return name || '';
}
fullPathPreview: string = '';
itemsave(): void {
  let fullPath = this.computeFullPath().replace(/\/+/g, '/'); // collapse multiple slashes to one

  if (fullPath.endsWith('/')) {
    fullPath = fullPath.slice(0, -1); // remove trailing slash
  }

  if (fullPath.startsWith('/')) {
    fullPath = fullPath.slice(1); // remove leading slash if needed
  }

<<<<<<< HEAD
  // auto-generate code
  const generatedCode = 'AC-' + Math.random().toString(36).substring(2, 8).toUpperCase();


=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
  const payload = {
    id: null,
    type: this.categoryForm.value.parentCategory.type || this.categoryForm.value.parentCategory,
    lmu: fullPath,
<<<<<<< HEAD
    code: this.categoryForm.value.name,
    generatedCode: generatedCode                // auto-generated
=======
    code: this.categoryForm.value.name
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
  };

  console.log('aaa', payload);

  this.categoryService.create(payload).subscribe({
    next: (response) => {
      this._snackBarService.open("Category created successfully!", "Close", {
        duration: 3000,
      });
      this.dialogRef.close(true);
      window.location.reload();
    },
    error: (err) => {
      console.error('Error creating category:', err);
    }
  });
}

  onSave(): void {
    if (this.categoryForm.valid) {
      this.itemsave();
    } else {
      console.warn('Form is invalid');
    }
  }
<<<<<<< HEAD



=======
>>>>>>> 000a1c8ebb8750b6a4c0438765135f41821067ca
}
