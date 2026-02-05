// Angular Material & Fuse
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
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
import { IStudentProfile } from '../student-profile.model';
import { StudentProfileService } from '../service/student-profile.service';
import { StudentProfileFormComponent } from '../form/student-profile-form.component';
import { EnrollmentStatus } from '../../../enums/enrollment-status.model';
import { VerifyDialogComponent } from './verify-dialog.component';
import { Component, AfterViewInit, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { merge, of, startWith, Subject, switchMap, tap, catchError } from 'rxjs';
import { StudentApplicationFormComponent } from '../../student-application-form/student-application-form.component';

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
  selector: 'app-student-profile-list',
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
    StudentProfileFormComponent,
  ],
  templateUrl: './student-profile-list.component.html',
})
export class StudentProfileListComponent implements AfterViewInit, OnInit {
  // --- Injected Services ---
  private readonly studentProfileService = inject(StudentProfileService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<StudentProfileListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);

  // --- State & Triggers ---
  isLoading = true;
  totalItems = 0;
  itemsPerPage = 10;
  private readonly refreshTrigger = new Subject<void>();
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};
  selectedStudentProfile: IStudentProfile | null = null;
  drawerMode: 'new' | 'edit' = 'new';
  readonly enrollmentStatusOptions = Object.keys(EnrollmentStatus);

  // --- Filter configuration ---
  filterFields: FilterField[] = [
    { key: 'studentNumber', label: 'StudentNumber', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
    { key: 'studentName', label: 'Student Name', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
    { key: 'nic', label: 'Nic', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
    { key: 'dateOfBirth', label: 'DateOfBirth', valueType: 'date', operators: FILTER_OPERATOR_LIBRARY['date'], rawFieldType: 'LocalDate' },
    { key: 'address', label: 'Address', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
    { key: 'enrollmentStatus', label: 'EnrollmentStatus', valueType: 'enum', operators: FILTER_OPERATOR_LIBRARY['enum'], rawFieldType: 'EnrollmentStatus', enumOptionsKey: 'enrollmentStatusOptions' },
    { key: 'createdAt', label: 'CreatedAt', valueType: 'date', operators: FILTER_OPERATOR_LIBRARY['date'], rawFieldType: 'Instant' },
  ];

  filtersForm: FormGroup = this.buildFiltersForm();

  // --- Table & Drawer ---
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild('formDrawer') formDrawer!: MatDrawer;

  @ViewChild(MatPaginator) set paginatorSetter(paginator: MatPaginator) {
    if (paginator) {
      this._paginator = paginator;
      // paginator.page.subscribe(this.pageChangeSubject);
    }
  }

  @ViewChild(MatSort) set sortSetter(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      sort.sortChange.subscribe(this.sortChangeSubject);
    }
  }

  private router: Router = inject(Router);
  private _paginator: MatPaginator | undefined;
  private _sort: MatSort | undefined;
  private sortChangeSubject = new Subject<Sort>();
  private pageChangeSubject = new Subject<PageEvent>();

  displayedColumns: string[] = [
    'id',
    // 'studentNumber',
    'studentName',
    'nic',
    'dateOfBirth',
    'address',
    'enrollmentStatus',
    'createdAt',
    'actions'
  ];

  dataSource = new MatTableDataSource<IStudentProfile>();

  ngOnInit(): void {
    if (this.dialogData?.parentFilters) {
      this.baseParentFilters = { ...this.dialogData.parentFilters };
    }
  }

  ngAfterViewInit(): void {
    const triggers$ = merge(this.sortChangeSubject, this.pageChangeSubject, this.refreshTrigger).pipe(startWith({}));

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
    // this.dataSource.filterPredicate = this.buildFilterPredicate();
  }

  loadData(): void {
    if (!this._paginator) {
      return;
    }

    this.isLoading = true;
    const req = {
      // page: this._paginator.pageIndex,
      // size: this._paginator.pageSize,
      sort: this.getSortParameters(),
      ...this.baseParentFilters,
      ...this.activeFilters,
    };

    this.studentProfileService.query(req)
      .pipe(
        tap(res => {
          this.isLoading = false;
          // this.totalItems = Number(res.headers.get('X-Total-Count') ?? 0);
          this.dataSource.data = res.body ?? [];
          this.dataSource.paginator = this._paginator!;
        }),
        catchError(() => {
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  getSortParameters(): string[] {
    if (!this._sort || !this._sort.active || this._sort.direction === '') {
      return ['id,asc'];
    }
    return [`${this._sort.active},${this._sort.direction}`];
  }

  openFormDrawer(id?: number): void {
    if (id) {
      this.drawerMode = 'edit';
      this.studentProfileService.find(id).subscribe(response => {
        if (response.body) {
          this.selectedStudentProfile = response.body;
          this.formDrawer.open();
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedStudentProfile = null;
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
      title: 'Delete StudentProfile',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: {
        confirm: { label: 'Delete' }
      },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this.studentProfileService.delete(id).subscribe(() => {
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
      if (!operator) return;

      const operatorConfig = field.operators.find(item => item.key === operator);
      if (!operatorConfig) return;

      const rawValue = group.get('value')?.value;
      if (operatorConfig.requiresValue) {
        if (rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) return;
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
          if (Number.isNaN(numeric)) return;
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

      if (paramValue === null) return;
      filters[`${field.key}.${operator}`] = paramValue;
    });

    this.activeFilters = filters;

    // Reset paginator to first page
    if (this._paginator) {
      this._paginator.firstPage();
    }

    // Trigger data reload
    this.refreshTrigger.next();

    // Close the drawer
    this.closeFilterDrawer();

    // Debug: log filters to make sure they are sent correctly
    console.log('Active Filters:', this.activeFilters);

    this.dataSource.filterPredicate = (data: IStudentProfile, filter: string) => {
      const filters = JSON.parse(filter);
      return Object.keys(filters).every(key => {
        const [field, operator] = key.split('.');
        const value = filters[key];

        const dataValue = data[field];
        if (dataValue === null || dataValue === undefined) return false;

        switch (operator) {
          case 'contains':
            return String(dataValue).toLowerCase().includes(String(value).toLowerCase());
          case 'equals':
            return String(dataValue).toLowerCase() === String(value).toLowerCase();
          case 'notEquals':
            return String(dataValue).toLowerCase() !== String(value).toLowerCase();
          case 'greaterThan':
            return dataValue > value;
          case 'lessThan':
            return dataValue < value;
          default:
            return true;
        }
      });
    };

    // Apply filter locally (optional)
    this.dataSource.filter = JSON.stringify(this.activeFilters);


  }

  clearFilters(): void {
    this.filterFields.forEach(field => this.clearField(field.key));
    this.activeFilters = {};
    this.dataSource.filter = '';
    this.dataSource.paginator?.firstPage();
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
    if (!field.enumOptionsKey) return [];
    return (this as any)[field.enumOptionsKey] ?? [];
  }

  private buildFiltersForm(): FormGroup {
    const groupConfig = this.filterFields.reduce((acc, field) => {
      acc[field.key] = this.fb.group({ operator: [''], value: [null] });
      return acc;
    }, {} as Record<string, FormGroup>);

    return this.fb.group(groupConfig);
  }

  private currentOperatorConfig(field: FilterField): FilterFieldOperator | undefined {
    const group = this.fieldGroup(field.key);
    if (!group) return undefined;

    const operator = group.get('operator')?.value as string | undefined;
    return field.operators.find(item => item.key === operator);
  }

  openVerifyDialog(studentProfile: IStudentProfile): void {
    const dialogRef = this.dialog.open(VerifyDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { student: studentProfile },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.refreshTrigger.next();
        this.loadData();
      }
    });
  }

  openStudentApplicationForm(): void {
    this.router.navigate(['/student-application-form']);
  }
}