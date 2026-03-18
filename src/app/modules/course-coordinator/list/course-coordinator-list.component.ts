import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { merge, of, startWith, Subject, catchError, tap, switchMap } from 'rxjs';

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
import { ICourseCoordinator } from '../course-coordinator.model';
import { CourseCoordinatorService, EntityResponseType, EntityArrayResponseType } from '../service/course-coordinator.service';
import { CourseCoordinatorFormComponent } from '../form/course-coordinator-form.component';

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
  selector: 'app-course-coordinator-list',
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
    CourseCoordinatorFormComponent,
  ],
  templateUrl: './course-coordinator-list.component.html',
})
export class CourseCoordinatorListComponent implements AfterViewInit, OnInit {
  private readonly courseCoordinatorService = inject(CourseCoordinatorService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<CourseCoordinatorListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);

  isLoading = true;
  totalItems = 0;
  itemsPerPage = 10;
  private readonly refreshTrigger = new Subject<void>();
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};

  selectedCourseCoordinator: ICourseCoordinator | null = null;
  drawerMode: 'new' | 'edit' = 'new';

  filterFields: FilterField[] = [
    { key: 'fullName', label: 'FullName', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY.string, rawFieldType: 'String' },
    { key: 'teleNo', label: 'TeleNo', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY.string, rawFieldType: 'String' },
    { key: 'email', label: 'Email', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY.string, rawFieldType: 'String' },
    { key: 'nic', label: 'Nic', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY.string, rawFieldType: 'String' },
    { key: 'isActive', label: 'IsActive', valueType: 'boolean', operators: FILTER_OPERATOR_LIBRARY.boolean, rawFieldType: 'Boolean' },
  ];

  filtersForm: FormGroup = this.buildFiltersForm();

  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild('formDrawer') formDrawer!: MatDrawer;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'fullName', 'teleNo', 'email', 'nic', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<ICourseCoordinator>();

  ngOnInit(): void {
    if (this.dialogData?.parentFilters) {
      this.baseParentFilters = { ...this.dialogData.parentFilters };
    } else {
      // Handle route params for parent filters
      const params = this.route.snapshot.params;
      const parentIdKey = Object.keys(params)[0];
      if (parentIdKey) {
        const parentModelName = parentIdKey.replace('Id', '');
        this.baseParentFilters[`${parentModelName}Id.equals`] = params[parentIdKey];
      }
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

    this.courseCoordinatorService.query(req).pipe(
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
    if (!this.sort || !this.sort.active || this.sort.direction === '') return ['id,asc'];
    return [`${this.sort.active},${this.sort.direction}`];
  }

  openFormDrawer(id?: number): void {
    if (id) {
      this.drawerMode = 'edit';
      this.courseCoordinatorService.find(id).subscribe({
        next: (res) => {
          this.selectedCourseCoordinator = res.body;
          this.formDrawer.open();
        },
        error: (err) => {
          console.error('Error fetching course coordinator:', err);
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedCourseCoordinator = null;
      this.formDrawer.open();
    }
  }


  closeFormDrawer(): void { this.formDrawer.close(); }
  openFilterDrawer(): void { this.filterDrawer.open(); }
  closeFilterDrawer(): void { this.filterDrawer.close(); }

  handleFormSaved(): void {
    this.closeFormDrawer();
    this.refreshTrigger.next();
    this.loadData();
    this.dialogRef?.close(true);
  }

  delete(id: number): void {
    const confirmation = this.fuseConfirmationService.open({
      title: 'Delete CourseCoordinator',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: { confirm: { label: 'Delete' } },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this.courseCoordinatorService.delete(id).subscribe(() => {
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

      const operatorConfig = field.operators.find(o => o.key === operator);
      if (!operatorConfig) return;

      let paramValue: string | null = null;
      const rawValue = group.get('value')?.value;

      if (operatorConfig.requiresValue) {
        if (rawValue === null || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) return;
      }

      switch (operatorConfig.valueType) {
        case 'boolean': paramValue = rawValue === true || rawValue === 'true' ? 'true' : 'false'; break;
        case 'number': const numeric = Number(rawValue); if (!Number.isNaN(numeric)) paramValue = String(numeric); break;
        case 'date': if (rawValue instanceof Date) paramValue = rawValue.toISOString(); else if (typeof rawValue === 'string') paramValue = rawValue; break;
        default: if (rawValue !== null && rawValue !== undefined) paramValue = String(rawValue);
      }

      if (paramValue !== null) filters[`${field.key}.${operator}`] = paramValue;
    });

    this.activeFilters = filters;
    this.paginator?.firstPage();
    this.refreshTrigger.next();
    this.closeFilterDrawer();
  }

  clearFilters(): void {
    this.filterFields.forEach(f => this.clearField(f.key));
    this.activeFilters = {};
    this.paginator?.firstPage();
    this.refreshTrigger.next();
  }

  clearField(key: string): void {
    const group = this.fieldGroup(key);
    group?.setValue({ operator: '', value: null });
  }

  fieldGroup(key: string): FormGroup | null {
    return this.filtersForm.get(key) as FormGroup | null;
  }

  operatorRequiresInput(field: FilterField): boolean {
    return !!this.currentOperatorConfig(field)?.requiresValue;
  }

  currentOperatorValueType(field: FilterField): FilterValueType {
    return this.currentOperatorConfig(field)?.valueType ?? field.valueType;
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
    const operator = group?.get('operator')?.value as string | undefined;
    return field.operators.find(o => o.key === operator);
  }
}
