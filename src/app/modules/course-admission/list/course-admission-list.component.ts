// This is an EJS template. It generates the list component TypeScript file.
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { merge, of, startWith, Subject, catchError, switchMap, tap, forkJoin, finalize, map, Observable } from 'rxjs';

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
import { ICourseAdmission } from '../course-admission.model';
import { CourseAdmissionService } from '../service/course-admission.service';
import { CourseAdmissionFormComponent } from '../form/course-admission-form.component';
import { CourseAdmissionViewDialogComponent } from '../view/course-admission-view-dialog.component';
import { InvoiceService } from '../../invoice/service/invoice.service';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { DocumentService } from 'app/entities/document/service/document.service';
import { IDocument } from 'app/entities/document/document.model';
import { CourseAdmissionQualificationService } from 'app/modules/course-admission-qualification/service/course-admission-qualification.service';
import { ICourseAdmissionQualification } from 'app/modules/course-admission-qualification/course-admission-qualification.model';
import { StudentProfileService } from 'app/modules/student-profile/service/student-profile.service';
import { IStudentProfile } from 'app/modules/student-profile/student-profile.model';

import { ApplicationStatus } from 'app/enums/application-status.model';

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
  selector: 'app-course-admission-list',
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
    CourseAdmissionFormComponent,
  ],
  templateUrl: './course-admission-list.component.html',
})
export class CourseAdmissionListComponent implements AfterViewInit, OnInit {
  // --- Injected Services ---
  private readonly courseAdmissionService = inject(CourseAdmissionService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly paymentService = inject(PaymentService);
  private readonly documentService = inject(DocumentService);
  private readonly courseAdmissionQualificationService = inject(CourseAdmissionQualificationService);
  private readonly studentProfileService = inject(StudentProfileService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<CourseAdmissionListComponent>, { optional: true });
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

  selectedCourseAdmission: ICourseAdmission | null = null;
  drawerMode: 'new' | 'edit' = 'new';


  readonly applicationStatusOptions = Object.keys(ApplicationStatus);


  // --- Filter configuration ---
  filterFields: FilterField[] = [

    {
      key: 'fullName',
      label: 'FullName',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'nameWithInitials',
      label: 'NameWithInitials',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'permanentAddress',
      label: 'PermanentAddress',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'teleNo',
      label: 'TeleNo',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'mobileNo',
      label: 'MobileNo',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'whatsAppNo',
      label: 'WhatsAppNo',
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
      key: 'nic',
      label: 'Nic',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'dateOfBirth',
      label: 'DateOfBirth',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'LocalDate'
    },

    {
      key: 'employer',
      label: 'Employer',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'employerDesignation',
      label: 'EmployerDesignation',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'employerOfficialAddress',
      label: 'EmployerOfficialAddress',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'employerTeleNo',
      label: 'EmployerTeleNo',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'employerFaxNo',
      label: 'EmployerFaxNo',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'sponsorByWhom',
      label: 'SponsorByWhom',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'advertisementTypeOther',
      label: 'AdvertisementTypeOther',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'status',
      label: 'Status',
      valueType: 'enum' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['enum'],
      rawFieldType: 'ApplicationStatus',
      enumOptionsKey: 'applicationStatusOptions'
    },

    {
      key: 'appliedDateTime',
      label: 'AppliedDateTime',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'approval1Status',
      label: 'Approval1Status',
      valueType: 'boolean' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['boolean'],
      rawFieldType: 'Boolean'
    },

    {
      key: 'approval1DateTime',
      label: 'Approval1DateTime',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'approval2Status',
      label: 'Approval2Status',
      valueType: 'boolean' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['boolean'],
      rawFieldType: 'Boolean'
    },

    {
      key: 'approval2DateTime',
      label: 'Approval2DateTime',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'approval3Status',
      label: 'Approval3Status',
      valueType: 'boolean' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['boolean'],
      rawFieldType: 'Boolean'
    },

    {
      key: 'approval3DateTime',
      label: 'Approval3DateTime',
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

  displayedColumns: string[] = [
    'id',
    'fullName',
    //'nameWithInitials', 
    'permanentAddress', 
    //'teleNo',
    'mobileNo',
    // 'whatsAppNo', 
    'email',
    'nic',
    'dateOfBirth',
    // 'employer', 
    // 'employerDesignation', 
    // 'employerOfficialAddress', 
    // 'employerTeleNo', 
    // 'employerFaxNo', 
    // 'sponsorByWhom', 
    // 'advertisementTypeOther', 
    'status',
    // 'appliedDateTime', 
    // 'approval1Status', 
    // 'approval1DateTime', 
    // 'approval2Status', 
    // 'approval2DateTime', 
    // 'approval3Status', 
    // 'approval3DateTime', 
    'actions'
  ];
  dataSource = new MatTableDataSource<ICourseAdmission>();

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

    this.courseAdmissionService.query(req).pipe(
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
      this.courseAdmissionService.find(id).subscribe(response => {
        if (response.body) {
          this.selectedCourseAdmission = response.body;
          this.formDrawer.open();
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedCourseAdmission = null;
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
      title: 'Delete CourseAdmission',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: { confirm: { label: 'Delete' } },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed' && !this.deletingIds.has(id)) {
        this.deletingIds.add(id);

        this.deleteCourseAdmissionWithDependencies(id)
          .pipe(finalize(() => this.deletingIds.delete(id)))
          .subscribe({
            next: () => {
              this.snackBar.open('Student deleted successfully.', 'Close', { duration: 3000 });
              this.refreshTrigger.next();
              this.loadData();
            },
            error: error => {
              console.error('Failed to delete course admission', error);
              this.snackBar.open(this.getDeleteErrorMessage(error), 'Close', { duration: 7000 });
            },
          });
      }
    });
  }

  view(id: number): void {
    this.dialog.open(CourseAdmissionViewDialogComponent, {
      data: { courseAdmissionId: id },
      width: '80vw',
      height: '75vh',
      maxWidth: '1200px',
      maxHeight: '95vh',
      panelClass: 'course-admission-view-dialog',
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

  private deleteCourseAdmissionWithDependencies(id: number): Observable<HttpResponse<{}>> {
    return this.courseAdmissionService.find(id).pipe(
      map(response => response.body),
      switchMap(admission => {
        if (!admission) {
          throw new Error(`Course admission ${id} not found.`);
        }

        const nic = String(admission.nic ?? '').trim();

        return forkJoin({
          invoices: this.invoiceService.query({ page: 0, size: 500, 'courseAdmissionId.equals': id }).pipe(
            map(response => response.body ?? [])
          ),
          qualifications: this.courseAdmissionQualificationService.query({ page: 0, size: 500, 'courseAdmissionId.equals': id }).pipe(
            map(response => response.body ?? []),
            catchError(() => of([] as ICourseAdmissionQualification[]))
          ),
          studentProfiles: nic
            ? this.studentProfileService.query({ page: 0, size: 500, 'nic.equals': nic }).pipe(
                map(response => response.body ?? []),
                catchError(() => of([] as IStudentProfile[]))
              )
            : of([] as IStudentProfile[]),
        }).pipe(
          switchMap(({ invoices, qualifications, studentProfiles }) => {
            const invoiceIds = invoices
              .map(invoice => invoice.id)
              .filter((invoiceId): invoiceId is number => invoiceId != null);

            const qualificationIds = qualifications
              .map(qualification => qualification.id)
              .filter((qualificationId): qualificationId is number => qualificationId != null);

            const studentProfileIds = studentProfiles
              .map(studentProfile => studentProfile.id)
              .filter((studentProfileId): studentProfileId is number => studentProfileId != null);

            return this.loadPaymentsForInvoices(invoiceIds).pipe(
              switchMap(paymentIds =>
                this.loadDocumentsForDependencies(paymentIds, invoiceIds).pipe(
                  switchMap(documents => this.deleteDocuments(documents)),
                  switchMap(() => this.deletePayments(paymentIds)),
                  switchMap(() => this.deleteInvoices(invoiceIds)),
                  switchMap(() => this.deleteQualifications(qualificationIds)),
                  switchMap(() => this.deleteStudentProfiles(studentProfileIds)),
                  switchMap(() => this.courseAdmissionService.delete(id))
                )
              )
            );
          })
        );
      })
    );
  }

  private loadPaymentsForInvoices(invoiceIds: number[]): Observable<number[]> {
    if (!invoiceIds.length) {
      return of([]);
    }

    return forkJoin(
      invoiceIds.map(invoiceId =>
        this.paymentService.query({ page: 0, size: 500, 'invoiceId.equals': invoiceId }).pipe(
          map(response => response.body ?? []),
          catchError(() => of([]))
        )
      )
    ).pipe(
      map(paymentGroups =>
        [...new Set(
          paymentGroups
            .flat()
            .map(payment => payment.id)
            .filter((paymentId): paymentId is number => paymentId != null)
        )]
      )
    );
  }

  private loadDocumentsForDependencies(paymentIds: number[], invoiceIds: number[]): Observable<IDocument[]> {
    const documentRequests: Observable<IDocument[]>[] = [
      ...paymentIds.map(paymentId =>
        this.documentService.query({ page: 0, size: 500, 'paymentId.equals': paymentId }).pipe(
          map(response => response.body ?? []),
          catchError(() => of([]))
        )
      ),
      ...invoiceIds.map(invoiceId =>
        this.documentService.getDocumentsByInvoiceId(invoiceId).pipe(
          catchError(() => of([]))
        )
      ),
    ];

    if (!documentRequests.length) {
      return of([]);
    }

    return forkJoin(documentRequests).pipe(
      map(documentGroups => documentGroups.flat()),
      map(documents => [...new Map(documents.filter(document => document?.id != null).map(document => [document.id, document])).values()])
    );
  }

  private deleteDocuments(documents: IDocument[]): Observable<unknown> {
    if (!documents.length) {
      return of([]);
    }

    return forkJoin(documents.map(document => this.documentService.delete(document.id)));
  }

  private deletePayments(paymentIds: number[]): Observable<unknown> {
    if (!paymentIds.length) {
      return of([]);
    }

    return forkJoin(paymentIds.map(paymentId => this.paymentService.delete(paymentId)));
  }

  private deleteInvoices(invoiceIds: number[]): Observable<unknown> {
    if (!invoiceIds.length) {
      return of([]);
    }

    return forkJoin(invoiceIds.map(invoiceId => this.invoiceService.delete(invoiceId)));
  }

  private deleteQualifications(qualificationIds: number[]): Observable<unknown> {
    if (!qualificationIds.length) {
      return of([]);
    }

    return forkJoin(
      qualificationIds.map(qualificationId => this.courseAdmissionQualificationService.delete(qualificationId))
    );
  }

  private deleteStudentProfiles(studentProfileIds: number[]): Observable<unknown> {
    if (!studentProfileIds.length) {
      return of([]);
    }

    return forkJoin(
      studentProfileIds.map(studentProfileId => this.studentProfileService.delete(studentProfileId))
    );
  }

  private getDeleteErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail || error.error?.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Unable to delete this student. Please try again.';
  }
}
