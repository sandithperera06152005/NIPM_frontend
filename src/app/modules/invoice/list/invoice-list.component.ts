import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
// Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ReactiveFormsModule } from '@angular/forms';


// Application Imports
import { IInvoice } from '../invoice.model';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceFormComponent } from '../form/invoice-form.component';
import { RegistrationNumberDialogComponent } from '../registration-number-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../../entities/document/service/document.service';
import { CourseAdmissionService } from '../../course-admission/service/course-admission.service';
import { ICourseAdmission } from '../../course-admission/course-admission.model';
import { ApplicationStatus } from '../../../enums/application-status.model';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { IPayment } from 'app/entities/payment/payment.model';
import { IMembershipAdmission } from 'app/modules/membership-admission/membership-admission.model';
import { MembershipAdmissionService } from 'app/modules/membership-admission/service/membership-admission.service';



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

interface InvoiceMembershipLink {
  invoice: IInvoice;
  membershipAdmissionId: number | null;
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
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    InvoiceFormComponent,
    ReactiveFormsModule,
    MatSidenavModule,
    RegistrationNumberDialogComponent,
  ],

  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements AfterViewInit, OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly courseAdmissionService = inject(CourseAdmissionService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<InvoiceListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private readonly paymentService = inject(PaymentService);
  private readonly membershipAdmissionService = inject(MembershipAdmissionService);


  searchNic: string = '';
  searchInvoiceNo: string = '';
  searchRegistrationNumber: string = '';
  searchDateFrom: Date | null = null;
  searchDateTo: Date | null = null;
  isLoading = false;
  totalItems = 0;
  itemsPerPage = 10;
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};
  private allInvoices: IInvoice[] = [];

  selectedInvoice: IInvoice | null = null;
  drawerMode: 'new' | 'edit' = 'new';

  filterFields: FilterField[] = [

    {
      key: 'invoiceNo',
      label: 'InvoiceNo',
      valueType: 'string' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['string'],
      rawFieldType: 'String'
    },

    {
      key: 'issuedDate',
      label: 'IssuedDate',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'dueDate',
      label: 'DueDate',
      valueType: 'date' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['date'],
      rawFieldType: 'Instant'
    },

    {
      key: 'totalAmount',
      label: 'TotalAmount',
      valueType: 'number' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['number'],
      rawFieldType: 'BigDecimal'
    },

    {
      key: 'paidAmount',
      label: 'PaidAmount',
      valueType: 'number' as FilterValueType,
      operators: FILTER_OPERATOR_LIBRARY['number'],
      rawFieldType: 'BigDecimal'
    },


  ];

  filtersForm: FormGroup = this.buildFiltersForm();

  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild('formDrawer') formDrawer!: MatDrawer;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  displayedColumns: string[] = [
    'id',
    //'studentName',
    'studentNic',
    'registrationNumber',
    'invoiceNo',
    'issuedDate',
    'dueDate',
    'totalAmount',
    'outstandingAmount',
    'paidAmount',
    'receivedDocument',
    'actions'
  ];

  dataSource = new MatTableDataSource<IInvoice>();

  ngOnInit(): void {
    if (this.dialogData?.parentFilters) {
      this.baseParentFilters = { ...this.dialogData.parentFilters };
      this.loadData();
    } else {
      this.route.params.subscribe(params => {
        this.baseParentFilters = {};
        const parentIdKey = Object.keys(params)[0];
        if (parentIdKey) {
          const parentModelName = parentIdKey.replace('Id', '');
          this.baseParentFilters[`${parentModelName}Id.equals`] = params[parentIdKey];
        }
        this.loadData();
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  approvedInvoices: Set<number> = new Set<number>();

  loadData(): void {
    this.isLoading = true;
    const req = {
      page: 0,
      size: 5000,
      sort: ['id,desc'],
      ...this.baseParentFilters,
      ...this.activeFilters,
    };

    this.invoiceService.query(req).pipe(
      switchMap(res => {
        const invoices = res.body ?? [];
        this.totalItems = Number(res.headers.get('X-Total-Count') ?? invoices.length);
        this.markApprovedInvoices(invoices);
        return this.loadInvoiceDocuments(invoices).pipe(
          switchMap(enrichedInvoices => this.loadMembershipAdmissionsForInvoices(enrichedInvoices)),
          tap(enrichedInvoices => {
            this.allInvoices = this.sortInvoices(enrichedInvoices);
            this.applySearchFilters();
          }),
        );
      }),
      tap(() => this.isLoading = false),
      catchError(() => {
        this.isLoading = false;
        this.allInvoices = [];
        this.dataSource.data = [];
        return of(null);
      })
    ).subscribe();
  }

  approvePayment(invoice: IInvoice): void {
    if (!invoice.id) {
      alert('Invoice ID is missing!');
      return;
    }

    const paidAmount = Number(invoice.paidAmount);
    if (!paidAmount || paidAmount <= 0) {
      alert('Please enter a valid paid amount before approving.');
      return;
    }

    if (!invoice.courseAdmission?.id) {
      this.invoiceService.find(invoice.id).subscribe({
        next: res => {
          const fullInvoice = res.body;
          if (!fullInvoice) {
            alert('Invoice not found on backend');
            return;
          }

          fullInvoice.paidAmount = paidAmount;

          this.invoiceService.update(fullInvoice).subscribe({
            next: () => {
              this.approvedInvoices.add(invoice.id!);
              alert('Payment approved and saved!');
              this.loadData();
            },
            error: err => {
              console.error('Failed to update membership invoice', err);
              alert('Failed to save paid amount');
            },
          });
        },
        error: err => {
          console.error('Failed to fetch membership invoice', err);
          alert('Cannot fetch invoice from backend');
        },
      });
      return;
    }

    const existingRegistrationNumber = this.getExistingRegistrationNumberForSeries(invoice);
    if (existingRegistrationNumber) {
      this.approveCourseInvoice(invoice, paidAmount, existingRegistrationNumber);
      return;
    }

    const dialogRef = this.dialog.open(RegistrationNumberDialogComponent);
    dialogRef.afterClosed().subscribe((registrationNumber: string | null) => {
      if (!registrationNumber) {
        return;
      }

      this.approveCourseInvoice(invoice, paidAmount, registrationNumber);
    });
  }

  public isApproved(invoice: IInvoice): boolean {
    return invoice.id != null && this.approvedInvoices.has(invoice.id);
  }

  // searchByNic(): void {
  //   // If search field is empty or length is not 12, clear data
  //   //|| this.searchNic.trim().length !== 12
  //   if (!this.searchNic ) {
  //     this.dataSource.data = [];
  //     return;
  //   }

  //   this.isLoading = true;

  //   this.invoiceService.getByNic(this.searchNic).pipe(
  //     catchError(err => {
  //       console.error('Error fetching invoices', err);
  //       this.dataSource.data = [];
  //       this.isLoading = false;
  //       return of([]);
  //     })
  //   ).subscribe((res: IInvoice[]) => {
  //     // Sort ascending by invoiceNo
  //     this.dataSource.data = res.sort((a, b) => {
  //       const getNumber = (inv: string) => {
  //         const match = inv.match(/-(\d+)$/);
  //         return match ? parseInt(match[1], 10) : 0;
  //       };
  //       return getNumber(a.invoiceNo) - getNumber(b.invoiceNo);
  //     });

  //     // Mark approved invoices
  //     res.forEach(invoice => {
  //       if (invoice.paidAmount && invoice.paidAmount > 0) {
  //         this.approvedInvoices.add(invoice.id!);
  //       }
  //     });



  //     this.isLoading = false;
  //   });
  // }

  searchByNic(): void {
    const nic = this.searchNic.trim();
    if (!nic) {
      this.applySearchFilters();
      return;
    }

    this.isLoading = true;

    forkJoin({
      courseAdmissions: this.courseAdmissionService.query({ 'nic.equals': nic, page: 0, size: 500 }).pipe(
        map(res => res.body ?? []),
        catchError(() => of([] as ICourseAdmission[]))
      ),
      membershipAdmissions: this.membershipAdmissionService.query({ 'nic.equals': nic, page: 0, size: 500 }).pipe(
        map(res => res.body ?? []),
        catchError(() => of([] as IMembershipAdmission[]))
      ),
    }).pipe(
      switchMap(({ courseAdmissions, membershipAdmissions }) => {
        const membershipById = new Map<number, IMembershipAdmission>();
        membershipAdmissions.forEach(admission => {
          if (admission.id != null) {
            membershipById.set(admission.id, admission);
          }
        });

        const courseInvoiceRequests = courseAdmissions.map(admission =>
          this.invoiceService.query({ 'courseAdmissionId.equals': admission.id, page: 0, size: 500 }).pipe(
            map(res => res.body ?? []),
            catchError(() => of([] as IInvoice[]))
          )
        );

        const membershipPaymentRequests = membershipAdmissions.map(admission =>
          this.paymentService.query({ 'memberID.equals': admission.id, page: 0, size: 500 }).pipe(
            map(res => res.body ?? []),
            switchMap((payments: IPayment[]) =>
              payments.length > 0
                ? of(payments)
                : this.paymentService.query({ 'membershipAdmissionId.equals': admission.id, page: 0, size: 500 }).pipe(
                  map(fallbackRes => fallbackRes.body ?? []),
                  catchError(() => of([] as IPayment[]))
                )
            ),
            switchMap((payments: IPayment[]) => {
              const invoiceIds = [...new Set(payments.map(payment => payment.invoiceId).filter((id): id is number => typeof id === 'number'))];
              if (!invoiceIds.length) {
                return of([] as IInvoice[]);
              }

              return forkJoin(
                invoiceIds.map(invoiceId =>
                  this.invoiceService.find(invoiceId).pipe(
                    map(res => {
                      const invoice = res.body;
                      if (invoice) {
                        invoice.membershipAdmission =
                          membershipById.get(admission.id as number) ?? invoice.membershipAdmission ?? null;
                      }
                      return invoice;
                    }),
                    catchError(() => of(null))
                  )
                )
              ).pipe(
                map(invoices => invoices.filter((invoice): invoice is IInvoice => !!invoice))
              );
            }),
            catchError(() => of([] as IInvoice[]))
          )
        );

        const courseInvoices$ = courseInvoiceRequests.length
          ? forkJoin(courseInvoiceRequests).pipe(map(groups => groups.flat()))
          : of([] as IInvoice[]);

        const membershipInvoices$ = membershipPaymentRequests.length
          ? forkJoin(membershipPaymentRequests).pipe(map(groups => groups.flat()))
          : of([] as IInvoice[]);

        return forkJoin({
          courseInvoices: courseInvoices$,
          membershipInvoices: membershipInvoices$,
        });
      }),
      map(({ courseInvoices, membershipInvoices }) => {
        const merged = [...courseInvoices, ...membershipInvoices];
        const uniqueById = new Map<number, IInvoice>();
        merged.forEach(invoice => {
          if (invoice.id != null) {
            uniqueById.set(invoice.id, invoice);
          }
        });
        return Array.from(uniqueById.values());
      }),
      switchMap(invoices => this.loadInvoiceDocuments(invoices)),
      switchMap(invoices => this.loadMembershipAdmissionsForInvoices(invoices)),
      tap(invoices => {
        this.allInvoices = this.sortInvoices(invoices);
        this.totalItems = this.allInvoices.length;
        this.applySearchFilters();
        this.isLoading = false;
      }),
      catchError(err => {
        console.error('Error searching invoices by NIC', err);
        this.isLoading = false;
        this.allInvoices = [];
        this.dataSource.data = [];
        return of([] as IInvoice[]);
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
      this.invoiceService.find(id).subscribe(response => {
        if (response.body) {
          this.selectedInvoice = response.body;
          this.formDrawer.open();
        }
      });
    } else {
      this.drawerMode = 'new';
      this.selectedInvoice = null;
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
    this.loadData();
    this.dialogRef?.close(true);
  }

  delete(id: number): void {
    const confirmation = this.fuseConfirmationService.open({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      actions: { confirm: { label: 'Delete' } },
    });

    confirmation.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this.invoiceService.delete(id).subscribe(() => {
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
    this.loadData();
    this.closeFilterDrawer();
  }

  clearFilters(): void {
    this.filterFields.forEach(field => this.clearField(field.key));
    this.activeFilters = {};
    if (this.paginator) {
      this.paginator.firstPage();
    }
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

  openDocument(url: string): void {
    window.open(url, '_blank');
  }

  downloadDocument(doc: { id: number; fileName?: string | null }): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: blob => {
        const fileName = doc.fileName?.trim() || `document-${doc.id}`;
        this.downloadBlob(blob, fileName);
      },
      error: err => {
        console.error('Failed to download document', err);
        alert('Unable to download the document.');
      },
    });
  }


  clearSearch(): void {
    this.searchNic = '';
    this.searchInvoiceNo = '';
    this.searchRegistrationNumber = '';
    this.searchDateFrom = null;
    this.searchDateTo = null;
    this.loadData();
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

  private applySearchFilters(): void {
    const nicTerm = this.normalizeSearchValue(this.searchNic);
    const invoiceNoTerm = this.normalizeSearchValue(this.searchInvoiceNo);
    const registrationTerm = this.normalizeSearchValue(this.searchRegistrationNumber);
    const fromDate = this.searchDateFrom ? new Date(this.searchDateFrom) : null;
    const toDate = this.searchDateTo ? new Date(this.searchDateTo) : null;

    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
    }

    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    const matchingCourseAdmissionIds = registrationTerm
      ? new Set(
        this.allInvoices
          .filter(invoice => this.normalizeSearchValue(invoice.registrationNumber).includes(registrationTerm))
          .map(invoice => invoice.courseAdmission?.id)
          .filter((id): id is number => typeof id === 'number')
      )
      : new Set<number>();

    const filteredInvoices = this.allInvoices.filter(invoice => {
      const invoiceNic = this.normalizeSearchValue(invoice.courseAdmission?.nic || invoice.membershipAdmission?.nic);
      const invoiceNo = this.normalizeSearchValue(invoice.invoiceNo);
      const invoiceRegistrationNumber = this.normalizeSearchValue(invoice.registrationNumber);
      const courseAdmissionId = invoice.courseAdmission?.id;
      const issuedDateValue = invoice.issuedDate ? new Date(invoice.issuedDate.toString()) : null;

      const nicMatches = !nicTerm || invoiceNic.includes(nicTerm);
      const invoiceNoMatches = !invoiceNoTerm || invoiceNo.includes(invoiceNoTerm);
      const registrationMatches =
        !registrationTerm ||
        invoiceRegistrationNumber.includes(registrationTerm) ||
        (typeof courseAdmissionId === 'number' && matchingCourseAdmissionIds.has(courseAdmissionId));
      const fromMatches = !fromDate || (!!issuedDateValue && issuedDateValue >= fromDate);
      const toMatches = !toDate || (!!issuedDateValue && issuedDateValue <= toDate);

      return nicMatches && invoiceNoMatches && registrationMatches && fromMatches && toMatches;
    });

    this.dataSource.data = this.sortInvoices(filteredInvoices);
  }

  private normalizeSearchValue(value: string | String | null | undefined): string {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  private approveCourseInvoice(invoice: IInvoice, paidAmount: number, registrationNumber: string): void {
    this.invoiceService.find(invoice.id!).subscribe({
      next: (res) => {
        const fullInvoice = res.body;
        if (!fullInvoice) {
          alert('Invoice not found on backend');
          return;
        }

        fullInvoice.paidAmount = paidAmount;
        fullInvoice.registrationNumber = registrationNumber;

        this.invoiceService.update(fullInvoice).pipe(
          switchMap(() => {
            const courseAdmissionId = fullInvoice.courseAdmission?.id;
            if (!courseAdmissionId) {
              return of(null);
            }

            return this.courseAdmissionService.find(courseAdmissionId).pipe(
              switchMap(courseAdmissionResponse => {
                const courseAdmission = courseAdmissionResponse.body;
                if (!courseAdmission) {
                  throw new Error('Course admission not found.');
                }

                courseAdmission.status = ApplicationStatus.APPROVED;
                return this.courseAdmissionService.update(courseAdmission);
              })
            );
          })
        ).subscribe({
          next: () => {
            this.approvedInvoices.add(invoice.id!);

            this.dataSource.data.forEach(inv => {
              if (inv.courseAdmission?.id === fullInvoice.courseAdmission?.id) {
                if (inv.courseAdmission) {
                  inv.courseAdmission.status = ApplicationStatus.APPROVED;
                }
                if (inv.id === invoice.id) {
                  inv.registrationNumber = registrationNumber;
                  inv.paidAmount = paidAmount;
                }
              }
            });
            this.dataSource._updateChangeSubscription();

            alert('Payment approved and saved!');
            this.loadData();
          },
          error: (err) => {
            console.error('Failed to approve course invoice', err);
            alert('Payment was saved, but the student admission status could not be updated.');
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch invoice', err);
        alert('Cannot fetch invoice from backend');
      }
    });
  }

  private getExistingRegistrationNumberForSeries(invoice: IInvoice): string | null {
    const courseAdmissionId = invoice.courseAdmission?.id;
    if (!courseAdmissionId) {
      return null;
    }

    const relatedInvoices = this.allInvoices.filter(inv => inv.courseAdmission?.id === courseAdmissionId);
    if (!relatedInvoices.length) {
      return null;
    }

    const firstInvoice =
      relatedInvoices.find(inv => this.getInvoiceLineNumber(inv.invoiceNo) === 1)
      ?? [...relatedInvoices].sort((a, b) => this.getInvoiceLineNumber(a.invoiceNo) - this.getInvoiceLineNumber(b.invoiceNo))[0];

    const firstInvoiceRegistration = firstInvoice?.registrationNumber?.trim();
    if (firstInvoiceRegistration) {
      return firstInvoiceRegistration;
    }

    const fallbackRegistration = relatedInvoices
      .map(inv => inv.registrationNumber?.trim())
      .find((registrationNumber): registrationNumber is string => !!registrationNumber);

    return fallbackRegistration ?? null;
  }

  private getInvoiceLineNumber(invoiceNo: string | null | undefined): number {
    const match = (invoiceNo ?? '').match(/-(\d+)$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }

  private sortInvoices(invoices: IInvoice[]): IInvoice[] {
    return [...invoices].sort((a, b) => (a.invoiceNo ?? '').localeCompare(b.invoiceNo ?? '', undefined, { numeric: true }));
  }

  private markApprovedInvoices(invoices: IInvoice[]): void {
    invoices.forEach(invoice => {
      if (invoice.id && invoice.paidAmount && invoice.paidAmount > 0) {
        this.approvedInvoices.add(invoice.id);
      }
    });
  }

  private loadInvoiceDocuments(invoices: IInvoice[]) {
    const docCalls = invoices.map(invoice =>
      invoice.id
        ? this.documentService.getDocumentByInvoiceId(invoice.id).pipe(
          tap(document => {
            invoice.document = document ? { id: document.id, fileName: document.fileName ?? null } : null;
          }),
          catchError(() => {
            invoice.document = null;
            return of(invoice);
          }),
          switchMap(() => of(invoice))
        )
        : of(invoice)
    );

    return forkJoin(docCalls);
  }

  private loadMembershipAdmissionsForInvoices(invoices: IInvoice[]) {
    const paymentCalls = invoices.map(invoice =>
      invoice.id
        ? this.paymentService.query({ page: 0, size: 1, 'invoiceId.equals': invoice.id }).pipe(
          map(res => ({
            invoice,
            membershipAdmissionId: res.body?.[0]?.membershipAdmission?.id ?? res.body?.[0]?.memberID ?? null,
          } as InvoiceMembershipLink)),
          catchError(() => of({ invoice, membershipAdmissionId: null } as InvoiceMembershipLink))
        )
        : of({ invoice, membershipAdmissionId: null } as InvoiceMembershipLink)
    );

    return forkJoin(paymentCalls).pipe(
      switchMap((results: InvoiceMembershipLink[]) => {
        const membershipIds = [...new Set(results.map(item => item.membershipAdmissionId).filter((id): id is number => !!id))];
        if (!membershipIds.length) {
          return of(invoices);
        }

        const membershipCalls = membershipIds.map(id =>
          this.membershipAdmissionService.find(id).pipe(
            map(response => response.body),
            catchError(() => of(null))
          )
        );

        return forkJoin(membershipCalls).pipe(
          map((memberships: Array<IMembershipAdmission | null>) => {
            const membershipMap = new Map<number, IMembershipAdmission>();
            memberships.forEach(membership => {
              if (membership?.id) {
                membershipMap.set(membership.id, membership);
              }
            });

            results.forEach(result => {
              if (result.membershipAdmissionId) {
                result.invoice.membershipAdmission = membershipMap.get(result.membershipAdmissionId) ?? null;
              }
            });

            return invoices;
          })
        );
      })
    );
  }
}
