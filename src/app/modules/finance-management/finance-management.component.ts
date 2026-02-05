// Angular Material & Fuse
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { FuseConfirmationService } from '@fuse/services/confirmation';

// Application Imports
import { IApplicant } from '../../entities/applicant/applicant.model';
import { ApplicantService } from '../../entities/applicant/service/applicant.service';
import { Component, AfterViewInit, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { merge, of, startWith, Subject, switchMap, tap, catchError } from 'rxjs';
import { size } from 'lodash';

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
    selector: 'app-finance-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
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
        MatChipsModule,
        MatMenuModule,
    ],
    templateUrl: './finance-management.component.html',
})
export class FinanceManagementComponent implements AfterViewInit, OnInit {
    // --- Injected Services ---
    private readonly applicantService = inject(ApplicantService);
    private readonly fuseConfirmationService = inject(FuseConfirmationService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    // --- State & Triggers ---
    isLoading = true;
    totalItems = 0;
    itemsPerPage = 10;
    searchTerm = '';
    private readonly refreshTrigger = new Subject<void>();
    private baseParentFilters: Record<string, string | number> = {};
    private activeFilters: Record<string, string> = {};
    private allApplicants: IApplicant[] = [];

    // --- Filter configuration ---
    filterFields: FilterField[] = [
        { key: 'fullName', label: 'Full Name', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'initialsName', label: 'Initials Name', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'dateOfBirth', label: 'Date Of Birth', valueType: 'date', operators: FILTER_OPERATOR_LIBRARY['date'], rawFieldType: 'LocalDate' },
        { key: 'gender', label: 'Gender', valueType: 'enum', operators: FILTER_OPERATOR_LIBRARY['enum'], rawFieldType: 'Gender', enumOptionsKey: 'genderOptions' },
        { key: 'nationality', label: 'Nationality', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'nicNumber', label: 'NIC Number', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'email', label: 'Email', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'mobileNumber', label: 'Mobile Number', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'district', label: 'District', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'preferredCourseType', label: 'Preferred Course Type', valueType: 'enum', operators: FILTER_OPERATOR_LIBRARY['enum'], rawFieldType: 'CourseType', enumOptionsKey: 'courseTypeOptions' },
        { key: 'financeType', label: 'Finance Type', valueType: 'enum', operators: FILTER_OPERATOR_LIBRARY['enum'], rawFieldType: 'FinanceType', enumOptionsKey: 'financeTypeOptions' },
        { key: 'sponsorName', label: 'Sponsor Name', valueType: 'string', operators: FILTER_OPERATOR_LIBRARY['string'], rawFieldType: 'String' },
        { key: 'declarationAccepted', label: 'Declaration Accepted', valueType: 'boolean', operators: FILTER_OPERATOR_LIBRARY['boolean'], rawFieldType: 'Boolean' },
    ];

    // Enum options
    genderOptions = ['MALE', 'FEMALE', 'OTHER'];
    courseTypeOptions = ['FULL_TIME', 'PART_TIME', 'DISTANCE_LEARNING', 'ONLINE'];
    financeTypeOptions = ['SELF_FUNDED', 'SPONSORED', 'LOAN', 'SCHOLARSHIP'];

    filtersForm: FormGroup = this.buildFiltersForm();

    // --- Table & Drawer ---
    @ViewChild('filterDrawer') filterDrawer!: MatDrawer;

    @ViewChild(MatPaginator) set paginatorSetter(paginator: MatPaginator) {
        if (paginator) {
            this._paginator = paginator;
        }
    }

    @ViewChild(MatSort) set sortSetter(sort: MatSort) {
        if (sort) {
            this._sort = sort;
            sort.sortChange.subscribe(this.sortChangeSubject);
        }
    }

    private _paginator: MatPaginator | undefined;
    private _sort: MatSort | undefined;
    private sortChangeSubject = new Subject<Sort>();
    private pageChangeSubject = new Subject<PageEvent>();

    displayedColumns: string[] = [
        'id',
        'fullName',
        'initialsName',
        'gender',
        'email',
        'mobileNumber',
        'actions'
    ];

    dataSource = new MatTableDataSource<IApplicant>();
    filteredDataSource = new MatTableDataSource<IApplicant>();

    ngOnInit(): void {
        // Initialize any parent filters if needed
    }

    ngAfterViewInit(): void {
        const triggers$ = merge(this.sortChangeSubject, this.pageChangeSubject, this.refreshTrigger).pipe(startWith({}));

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

        this.loadData();
    }

    loadData(): void {
        if (!this._paginator) {
            return;
        }

        this.isLoading = true;
        const req = {
            sort: this.getSortParameters(),
            ...this.baseParentFilters,
            ...this.activeFilters,
        };

        this.applicantService.query({ ...req, size:10000 })
            .pipe(
                tap(res => {
                    this.isLoading = false;
                    this.allApplicants = res.body ?? [];
                    this.dataSource.data = this.allApplicants;
                    this.dataSource.paginator = this._paginator!;
                    this.applySearchFilter();
                    this.totalItems = Number(res.headers.get('X-Total-Count'));

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

    openFilterDrawer(): void {
        this.filterDrawer.open();
    }

    closeFilterDrawer(): void {
        this.filterDrawer.close();
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

    viewApplicantDetails(applicant: IApplicant): void {
        // Navigate to finance-management-view with applicant id
        this.router.navigate(['/finance-management/view', applicant.id]);
    }

    processPayment(applicant: IApplicant): void {
        // Handle payment processing
        console.log('Process payment for applicant:', applicant);
    }

    exportApplicants(): void {
        // Export applicants data
        console.log('Export applicants');
    }

    getFinanceTypeColor(financeType: string | null | undefined): string {
        if (!financeType) return 'primary';
        switch (financeType) {
            case 'SELF_FUNDED':
                return 'accent';
            case 'SPONSORED':
                return 'warn';
            case 'LOAN':
                return 'primary';
            case 'SCHOLARSHIP':
                return 'accent';
            default:
                return 'primary';
        }
    }

    // --- Search Methods ---
    onSearchChange(searchTerm: string): void {
        this.searchTerm = searchTerm.trim().toLowerCase();
        this.applySearchFilter();
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.applySearchFilter();
    }

    private applySearchFilter(): void {
        if (!this.searchTerm) {
            this.filteredDataSource.data = [...this.allApplicants];
            this.totalItems = this.filteredDataSource.data.length;
        } else {
            this.filteredDataSource.data = this.allApplicants.filter(applicant =>

                applicant.fullName?.toLowerCase().includes(this.searchTerm)

            );
        }
        this.filteredDataSource.paginator = this._paginator;
    }

    onSortChange(sort: Sort): void {
        this.sortChangeSubject.next(sort);
    }
}
