// This is an EJS template. It generates the list component TypeScript file.
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { merge, of, startWith, Subject, catchError, switchMap, tap } from 'rxjs';

// Angular Material & Fuse
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';

// Application Imports
import { IAppUser } from '../app-user.model';
import { AppUserService } from '../service/app-user.service';
import { AppUserFormComponent } from '../form/app-user-form.component';

import { UserStatus } from 'app/enums/user-status.model';

type ParentDialogData = {
  parentFilters?: Record<string, string | number>;
};

type FilterValueType = 'string' | 'number' | 'date' | 'boolean' | 'enum';

interface FilterFieldOperator {
  key: string;
  label: string;
  requiresValue: boolean;
  valueType: FilterValueType;
}

interface FilterField {
  key: string;
  label: string;
  valueType: FilterValueType;
  operators: FilterFieldOperator[];
  rawFieldType?: string;
  enumOptionsKey?: string;
}

const FILTER_OPERATOR_LIBRARY: Record<FilterValueType, FilterFieldOperator[]> = {
  string: [
    { key: 'contains', label: 'Contains', requiresValue: true, valueType: 'string' },
    { key: 'equals', label: 'Equals', requiresValue: true, valueType: 'string' },
    { key: 'notEquals', label: 'Not Equals', requiresValue: true, valueType: 'string' },
    { key: 'specified', label: 'Is Specified', requiresValue: true, valueType: 'boolean' },
  ],
  number: [
    { key: 'equals', label: 'Equals', requiresValue: true, valueType: 'number' },
    { key: 'greaterThan', label: 'Greater Than', requiresValue: true, valueType: 'number' },
    { key: 'greaterThanOrEqual', label: 'Greater Than Or Equal', requiresValue: true, valueType: 'number' },
    { key: 'lessThan', label: 'Less Than', requiresValue: true, valueType: 'number' },
    { key: 'lessThanOrEqual', label: 'Less Than Or Equal', requiresValue: true, valueType: 'number' },
    { key: 'specified', label: 'Is Specified', requiresValue: true, valueType: 'boolean' },
  ],
  date: [
    { key: 'equals', label: 'On', requiresValue: true, valueType: 'date' },
    { key: 'greaterThanOrEqual', label: 'After Or Equal', requiresValue: true, valueType: 'date' },
    { key: 'lessThanOrEqual', label: 'Before Or Equal', requiresValue: true, valueType: 'date' },
    { key: 'specified', label: 'Is Specified', requiresValue: true, valueType: 'boolean' },
  ],
  boolean: [
    { key: 'equals', label: 'Equals', requiresValue: true, valueType: 'boolean' },
    { key: 'specified', label: 'Is Specified', requiresValue: true, valueType: 'boolean' },
  ],
  enum: [
    { key: 'equals', label: 'Equals', requiresValue: true, valueType: 'enum' },
    { key: 'notEquals', label: 'Not Equals', requiresValue: true, valueType: 'enum' },
    { key: 'specified', label: 'Is Specified', requiresValue: true, valueType: 'boolean' },
  ],
};

@Component({
  selector: 'app-app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AppUserFormComponent,
  ],
  templateUrl: './app-user-list.component.html',
})
export class AppUserListComponent implements AfterViewInit, OnInit {
  // --- Injected Services ---
  private readonly appUserService = inject(AppUserService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<AppUserListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);

  // --- State & Triggers ---
  isLoading = true;
  totalItems = 0;
  itemsPerPage = 10;
  private readonly refreshTrigger = new Subject<void>();
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};

  selectedAppUser: IAppUser | null = null;
  drawerMode: 'new' | 'edit' = 'new';


  readonly userStatusOptions = Object.keys(UserStatus);


  // --- Filter configuration ---
  filterFields: FilterField[] = [

    {
      key: 'username',
      label: 'Username',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'email',
      label: 'Email',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'passwordHash',
      label: 'PasswordHash',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'firstName',
      label: 'FirstName',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'lastName',
      label: 'LastName',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'phone',
      label: 'Phone',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'status',
      label: 'Status',
      valueType: 'enum' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['enum'],
      rawFieldType: 'UserStatus',
      enumOptionsKey: 'userStatusOptions'
    },

    {
      key: 'createdAt',
      label: 'CreatedAt',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'updatedAt',
      label: 'UpdatedAt',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'lastLoginAt',
      label: 'LastLoginAt',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },


  ];

  filtersForm: FormGroup = this.buildFiltersForm();

  // --- Table & Drawer ---
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild('formDrawer') formDrawer!: MatDrawer;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'username', 'email', 'passwordHash', 'firstName', 'lastName', 'phone', 'status', 'createdAt', 'updatedAt', 'lastLoginAt', 'actions'];
  dataSource = new MatTableDataSource<IAppUser>();

  ngOnInit(): void {
    if (this.dialogData?.parentFilters) {
      this.baseParentFilters = { ...this.dialogData.parentFilters };
    }
  }

  ngAfterViewInit(): void {
    const sortChange$ = this.sort ? this.sort.sortChange : of({});
    const page$ = this.paginator ? this.paginator.page : of({});
    const triggers$ = merge(sortChange$, page$, this.refreshTrigger).pipe(startWith({}));

    if (this.dialogData?.parentFilters) {
      triggers$.subscribe(() => this.loadData());
    } else {
      this.route.params
        .pipe(
          tap(params => {
            this.baseParentFilters = {};
            const parentIdKey = Object.keys(params)[0];
            if (parentIdKey) {
              const parentModelName = parentIdKey.replace('Id', '');
              this.baseParentFilters[`${parentModelName}Id.equals`] = params[parentIdKey];
            }
          }),
          switchMap(() => triggers$)
        )
        .subscribe(() => this.loadData());
    }

    this.loadData();
  }

  loadData(): void {
    if (!this.paginator) {
      return;
    }

    this.isLoading = true;
    const req = {
      page: this.paginator.pageIndex,
      size: this.paginator.pageSize,
      sort: this.getSortParameters(),
      ...this.baseParentFilters,
      ...this.activeFilters,
    };

    this.appUserService.query(req).pipe(
      tap(res => {
        this.isLoading = false;
        this.totalItems = Number(res.headers.get('X-Total-Count') ?? 0);
        this.dataSource.data = res.body ?? [];
      }),
      catchError(() => {
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  getSortParameters(): string[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return ['id,asc'];
    }
    return [`${this.sort.active},${this.sort.direction}`];
  }

  openFormDrawer(id?: number): void {
    if (id) {
      this.drawerMode = 'edit';
      this.appUserService.find(id).subscribe(response => {
        if (response.body) {
          this.selectedAppUser = response.body;
          this.formDrawer.open();
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedAppUser = null;
      this.formDrawer.open();
    }
  }

  closeFormDrawer(): void {
    this.formDrawer.close();
  }

  openFilterDrawer(): void {
    this.filterDrawer.open();
  }

  closeFilterDrawer(): void {
    this.filterDrawer.close();
  }

  handleFormSaved(): void {
    this.closeFormDrawer();
    this.refreshTrigger.next();
    this.loadData();
    this.dialogRef?.close(true);
  }

  delete(id: number): void {
    const confirmation = this.fuseConfirmationService.open({
      title: 'Delete AppUser',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: { confirm: { label: 'Delete' } },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this.appUserService.delete(id).subscribe(() => {
          this.refreshTrigger.next();
          this.loadData();
        });
      }
    });
  }

  applyFilters(): void {
    const filters: Record<string, string> = {};

    this.filterFields.forEach(field => {
      const group = this.fieldGroup(field.key);
      const operator = group?.get('operator')?.value as string | undefined;
      if (!operator) {
        return;
      }
      const operatorConfig = field.operators.find(item => item.key === operator);
      if (!operatorConfig) {
        return;
      }
      const rawValue = group.get('value')?.value;
      if (operatorConfig.requiresValue) {
        if (rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) {
          return;
        }
      }

      let paramValue: string | null = null;
      switch (operatorConfig.valueType) {
        case 'boolean': {
          const boolValue = rawValue === true || rawValue === 'true';
          paramValue = boolValue ? 'true' : 'false';
          break;
        }
        case 'number': {
          const numeric = typeof rawValue === 'number' ? rawValue : Number(rawValue);
          if (Number.isNaN(numeric)) {
            return;
          }
          paramValue = String(numeric);
          break;
        }
        case 'date': {
          if (rawValue instanceof Date) {
            if (field.rawFieldType === 'LocalDate') {
              const iso = rawValue.toISOString();
              paramValue = iso.split('T')[0];
            } else {
              paramValue = rawValue.toISOString();
            }
          } else if (typeof rawValue === 'string' && rawValue) {
            paramValue = rawValue;
          }
          break;
        }
        default: {
          if (rawValue !== null && rawValue !== undefined) {
            paramValue = String(rawValue);
          }
        }
      }

      if (paramValue === null) {
        return;
      }

      filters[`${field.key}.${operator}`] = paramValue;
    });

    this.activeFilters = filters;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.refreshTrigger.next();
    this.loadData();
    this.closeFilterDrawer();
  }

  clearFilters(): void {
    this.filterFields.forEach(field => this.clearField(field.key));
    this.activeFilters = {};
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.refreshTrigger.next();
    this.loadData();
  }

  clearField(key: string): void {
    const group = this.fieldGroup(key);
    group?.setValue({ operator: '', value: null });
  }

  fieldGroup(key: string): FormGroup | null {
    return this.filtersForm.get(key) as FormGroup | null;
  }

  operatorRequiresInput(field: FilterField): boolean {
    const config = this.currentOperatorConfig(field);
    return !!config?.requiresValue;
  }

  currentOperatorValueType(field: FilterField): FilterValueType {
    return this.currentOperatorConfig(field)?.valueType ?? field.valueType;
  }

  getEnumOptions(field: FilterField): string[] {
    if (!field.enumOptionsKey) {
      return [];
    }
    return (this as any)[field.enumOptionsKey] ?? [];
  }



  private buildFiltersForm(): FormGroup {
    const groupConfig = this.filterFields.reduce((acc, field) => {
      acc[field.key] = this.fb.group({
        operator: [''],
        value: [null],
      });
      return acc;
    }, {} as Record<string, FormGroup>);
    return this.fb.group(groupConfig);
  }

  private currentOperatorConfig(field: FilterField): FilterFieldOperator | undefined {
    const group = this.fieldGroup(field.key);
    if (!group) {
      return undefined;
    }
    const operator = group.get('operator')?.value as string | undefined;
    return field.operators.find(item => item.key === operator);
  }
}
