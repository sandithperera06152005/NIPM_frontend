import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { catchError, merge, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { forkJoin } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
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
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../../entities/document/service/document.service';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { IDocument } from 'app/entities/document/document.model';
import { IPayment } from 'app/entities/payment/payment.model';


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
    InvoiceFormComponent,
    ReactiveFormsModule,
    MatSidenavModule,
  ],

  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements AfterViewInit, OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly fuseConfirmationService = inject(FuseConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<InvoiceListComponent>, { optional: true });
  private readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as ParentDialogData | null;
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private paymentService = inject(PaymentService);


  searchNic: string = '';
  isLoading = false;
  totalItems = 0;
  itemsPerPage = 10;
  private readonly refreshTrigger = new Subject<void>();
  private baseParentFilters: Record<string, string | number> = {};
  private activeFilters: Record<string, string> = {};

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
    'invoiceNo',
    'issuedDate',
    'dueDate',
    'totalAmount',
    'receivedDocument',
    'paidAmount',
    'actions'
  ];

  dataSource = new MatTableDataSource<IInvoice>();

  ngOnInit(): void {
    if (this.dialogData?.parentFilters) {
      this.baseParentFilters = { ...this.dialogData.parentFilters };
    }
  }

  ngAfterViewInit(): void {
    const triggers$ = merge(this.sort.sortChange, this.paginator.page, this.refreshTrigger).pipe(startWith({}));

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

  approvedInvoices = new Set<number>();

  loadData(): void {
    if (!this.paginator) return;

    this.isLoading = true;

    const req = {
      page: this.paginator.pageIndex,
      size: this.paginator.pageSize,
      sort: this.getSortParameters(),
      ...this.baseParentFilters,
      ...this.activeFilters,
    };

    this.invoiceService.query(req).pipe(
      switchMap(res => {
        this.totalItems = Number(res.headers.get('X-Total-Count') ?? 0);
        this.dataSource.data = res.body ?? [];
        const invoices = res.body ?? [];

        if (!invoices.length) return of(null);

        // For each invoice, fetch documents
        const docCalls = invoices.map(invoice =>
          invoice.id
            ? this.documentService.getDocumentsByInvoiceId(invoice.id).pipe(
              switchMap(docs => {
                invoice.documents = docs ?? [];

                // For each document, fetch its payment
                const paymentCalls = invoice.documents.map(doc => {
                  if (doc.payment?.id) {
                    return this.paymentService.find(doc.payment.id).pipe(
                      tap(paymentRes => {
                        const payment = paymentRes.body;
                        if (payment) {
                          doc.payment = payment;

                          // Mark as approved if payment is completed
                          if (payment.paymentStatus === 'COMPLETED') {
                            this.approvedInvoices.add(doc.id!);
                          }
                        }
                      }),
                      catchError(err => {
                        console.error(`Error fetching payment for doc ${doc.id}`, err);
                        return of(null);
                      })
                    );
                  } else {
                    return of(null); // document has no payment
                  }
                });

                return paymentCalls.length ? forkJoin(paymentCalls) : of(null);
              }),
              catchError(err => {
                console.error(`Error fetching documents for invoice ${invoice.id}`, err);
                return of(null);
              })
            )
            : of(null)
        );

        return docCalls.length ? forkJoin(docCalls) : of(null);
      }),
      catchError(err => {
        console.error('Error loading invoices/documents/payments', err);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.dataSource._updateChangeSubscription();
      })
    ).subscribe();
  }
  // Track approved documents
  //approvedInvoices = new Set<number>();

  approvePayment(invoice: any, doc: any): void {

    if (this.isApproved(doc)) {
      return;
    }

    const enteredAmount = Number(doc.enteredPaidAmount);

    if (!enteredAmount || enteredAmount <= 0) {
      alert('Enter valid payment amount');
      return;
    }

    if (!invoice.id) {
      alert('Invoice ID missing');
      return;
    }


    this.invoiceService.find(invoice.id).subscribe({
      next: (res: any) => {

        const fullInvoice = res.body;

        if (!fullInvoice) {
          alert('Invoice not found');
          return;
        }

        const currentPaid = fullInvoice.paidAmount || 0;

        fullInvoice.paidAmount = currentPaid + enteredAmount;

        this.invoiceService.update(fullInvoice).subscribe({
          next: () => {

            const index = this.dataSource.data.findIndex((inv: any) => inv.id === invoice.id);

            if (index !== -1) {
              this.dataSource.data[index].paidAmount = fullInvoice.paidAmount;
              this.dataSource._updateChangeSubscription();
            }
            if (doc.payment?.id) {

              this.paymentService.find(doc.payment.id).subscribe({
                next: (paymentRes: any) => {

                  const fullPayment = paymentRes.body;

                  if (!fullPayment) {
                    console.error('Payment not found');
                    return;
                  }

                  // Change ONLY status
                  fullPayment.paymentStatus = 'COMPLETED';

                  this.paymentService.update(fullPayment).subscribe({
                    next: () => {
                      console.log('Payment status updated');
                    },
                    error: err => {
                      console.error('Payment status update failed', err);
                    }
                  });

                },
                error: err => {
                  console.error('Fetch payment failed', err);
                }
              });

            }
            this.approvedInvoices.add(doc.id);

            alert('Payment approved successfully');

          },
          error: err => {
            console.error('Invoice update failed', err);
            alert('Failed to update invoice');
          }
        });

      },
      error: err => {
        console.error('Fetch invoice failed', err);
        alert('Cannot fetch invoice');
      }
    });

  }

  isApproved(doc: any): boolean {
    return doc.payment?.paymentStatus === 'COMPLETED';
  }

  searchByNic(): void {
    if (!this.searchNic) { this.dataSource.data = []; return; }

    this.isLoading = true;
    this.invoiceService.getByNic(this.searchNic).pipe(
      switchMap((res: IInvoice[]) => {
        this.dataSource.data = res.sort((a, b) => {
          const getNum = (inv: string) => (inv.match(/-(\d+)$/) ? parseInt(inv.match(/-(\d+)$/)![1], 10) : 0);
          return getNum(a.invoiceNo) - getNum(b.invoiceNo);
        });

        // Mark approved
        res.forEach(invoice => { if (invoice.paidAmount && invoice.paidAmount > 0) this.approvedInvoices.add(invoice.id!); });

        // Load documents for search results
        const docCalls = res.map(inv =>
          inv.id
            ? this.documentService.getDocumentsByInvoiceId(inv.id).pipe(
              map(docs => { inv.documents = docs; }),
              catchError(() => of(null))
            )
            : of(null)
        );

        return forkJoin(docCalls);
      }),
      tap(() => this.isLoading = false),
      catchError(err => { console.error(err); this.isLoading = false; return of(null); })
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
    this.refreshTrigger.next();
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

  openDocument(url: string): void {
    window.open(url, '_blank');
  }


  clearSearch(): void {
    this.searchNic = '';
    this.dataSource.data = [];
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
