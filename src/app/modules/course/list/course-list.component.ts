// This is an EJS template. It generates the list component TypeScript file.
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, merge, Observable, of, startWith, Subject, catchError, finalize, map, switchMap, tap, throwError } from 'rxjs';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';

// Application Imports
import { ICourse } from '../course.model';
import { CourseService } from '../service/course.service';
import { CourseFormComponent } from '../form/course-form.component';
import { CourseInstallmentService } from '../update/course-installment.service';
import { CourseAdmissionService } from '../../course-admission/service/course-admission.service';


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

type LinkedCourseAdmissionsError = {
  type: 'linked-course-admissions';
  admissionsCount: number;
};

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
  selector: 'app-course-list',
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
    MatSnackBarModule,
    CourseFormComponent,
  ],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements AfterViewInit, OnInit {
  // --- Injected Services ---
  private readonly courseService = inject(CourseService);
  private readonly courseInstallmentService = inject(CourseInstallmentService);
  private readonly courseAdmissionService = inject(CourseAdmissionService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<CourseListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);

  // --- State & Triggers ---
  isLoading = true;
  totalItems = 0;
  itemsPerPage = 10;
  private readonly refreshTrigger = new Subject<void>();
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};
  deletingIds = new Set<number>();

  selectedCourse: ICourse | null = null;
  drawerMode: 'new' | 'edit' = 'new';



  // --- Filter configuration ---
  filterFields: FilterField[] = [

    {
      key: 'code',
      label: 'Code',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'title',
      label: 'Title',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'fee',
      label: 'Fee',
      valueType: 'number' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['number'],
      rawFieldType: 'BigDecimal'
    },

    {
      key: 'durationMonths',
      label: 'DurationMonths',
      valueType: 'number' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['number'],
      rawFieldType: 'Integer'
    },

    {
      key: 'active',
      label: 'Active',
      valueType: 'boolean' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['boolean'],
      rawFieldType: 'Boolean'
    },


  ];

  filtersForm: FormGroup = this.buildFiltersForm();

  // --- Table & Drawer ---
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild('formDrawer') formDrawer!: MatDrawer;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'code', 'title', 'fee', 'durationMonths', 'active', 'actions'];
  dataSource = new MatTableDataSource<ICourse>();

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

    this.courseService.query(req).pipe(
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

  getRowNumber(index: number): number {
    const pageIndex = this.paginator?.pageIndex ?? 0;
    const pageSize = this.paginator?.pageSize ?? this.itemsPerPage;
    return pageIndex * pageSize + index + 1;
  }

  openFormDrawer(id?: number): void {
    if (id) {
      this.drawerMode = 'edit';
      this.courseService.find(id).subscribe(response => {
        if (response.body) {
          this.selectedCourse = response.body;
          this.formDrawer.open();
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedCourse = null;
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
      title: 'Delete Course',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: { confirm: { label: 'Delete' } },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed' && !this.deletingIds.has(id)) {
        this.deletingIds.add(id);

        this.deleteCourseSafely(id)
          .pipe(finalize(() => this.deletingIds.delete(id)))
          .subscribe({
            next: () => {
              this.snackBar.open('Course deleted successfully.', 'Close', { duration: 3000 });
              this.refreshTrigger.next();
              this.loadData();
            },
            error: error => {
              if (this.isLinkedCourseAdmissionsError(error)) {
                this.confirmDeleteLinkedCourse(id, error.admissionsCount);
                return;
              }

              console.error('Failed to delete course', error);
              this.snackBar.open(this.getDeleteErrorMessage(error), 'Close', { duration: 7000 });
            },
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

  private deleteCourseSafely(id: number): Observable<HttpResponse<{}>> {
    return this.courseAdmissionService.query({ page: 0, size: 500, 'courseRefId.equals': id }).pipe(
      map(response => response.body ?? []),
      switchMap(admissions => {
        if (admissions.length > 0) {
          return throwError(() => ({ type: 'linked-course-admissions', admissionsCount: admissions.length } as LinkedCourseAdmissionsError));
        }

        return this.deleteCourseAfterDependenciesRemoved(id);
      })
    );
  }

  private confirmDeleteLinkedCourse(id: number, admissionsCount: number): void {
    const confirmation = this.fuseConfirmationService.open({
      title: 'Course Is In Use',
      message: `This course is linked to ${admissionsCount} course admission(s). Delete it anyway and keep those admissions by removing their course link?`,
      actions: {
        confirm: { label: 'Delete Anyway' },
        cancel: { label: 'Cancel' },
      },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result !== 'confirmed' || this.deletingIds.has(id)) {
        return;
      }

      this.deletingIds.add(id);

      this.forceDeleteCourseWithDetachedAdmissions(id)
        .pipe(finalize(() => this.deletingIds.delete(id)))
        .subscribe({
          next: () => {
            this.snackBar.open('Course deleted successfully. Linked admissions were preserved.', 'Close', { duration: 4000 });
            this.refreshTrigger.next();
            this.loadData();
          },
          error: error => {
            console.error('Failed to force delete course', error);
            this.snackBar.open(this.getDeleteErrorMessage(error), 'Close', { duration: 7000 });
          },
        });
    });
  }

  private forceDeleteCourseWithDetachedAdmissions(id: number): Observable<HttpResponse<{}>> {
    return this.courseAdmissionService.query({ page: 0, size: 500, 'courseRefId.equals': id }).pipe(
      map(response => response.body ?? []),
      switchMap(admissions => {
        const detachRequests = admissions.map(admission =>
          this.courseAdmissionService.update({
            ...admission,
            courseRefId: null,
            courseRef: null,
          } as any)
        );

        return (detachRequests.length ? forkJoin(detachRequests) : of([])).pipe(
          switchMap(() => this.deleteCourseAfterDependenciesRemoved(id))
        );
      })
    );
  }

  private deleteCourseAfterDependenciesRemoved(id: number): Observable<HttpResponse<{}>> {
    return this.courseInstallmentService.getByCourse(id).pipe(
      map(installments => installments ?? []),
      switchMap(installments => this.deleteCourseInstallments(installments.map(installment => installment.id))),
      switchMap(() => this.courseService.delete(id))
    );
  }

  private deleteCourseInstallments(installmentIds: Array<number | undefined>): Observable<unknown> {
    const validInstallmentIds = installmentIds.filter((installmentId): installmentId is number => installmentId != null);
    if (!validInstallmentIds.length) {
      return of([]);
    }

    return forkJoin(validInstallmentIds.map(installmentId => this.courseInstallmentService.delete(installmentId)));
  }

  private getDeleteErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail || error.error?.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }

    return 'Unable to delete this course. Please try again.';
  }

  private isLinkedCourseAdmissionsError(error: unknown): error is LinkedCourseAdmissionsError {
    return !!error && typeof error === 'object' && (error as LinkedCourseAdmissionsError).type === 'linked-course-admissions';
  }
}
