import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge, of, startWith, Subject, catchError, tap } from 'rxjs';

import { IMembershipAdmission } from '../membership-admission/membership-admission.model';
import { MembershipAdmissionService } from '../membership-admission/service/membership-admission.service';
import { ApplicationStatus } from '../../enums/application-status.model';
import { ViewApprovalComponent, ViewApprovalDialogData, ViewApprovalDialogResult } from './view-approval/view-approval.component';

@Component({
    selector: 'app-approvals',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatTabsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './approvals.component.html',
})
export class ApprovalsComponent implements AfterViewInit, OnInit {
    private readonly membershipAdmissionService = inject(MembershipAdmissionService);
    private readonly dialog = inject(MatDialog);

    // State for Submitted tab
    submittedIsLoading = true;
    submittedTotalItems = 0;
    submittedItemsPerPage = 10;
    private readonly submittedRefreshTrigger = new Subject<void>();
    submittedDataSource = new MatTableDataSource<IMembershipAdmission>();
    filteredSubmittedDataSource = new MatTableDataSource<IMembershipAdmission>();

    // State for Approved tab
    approvedIsLoading = true;
    approvedTotalItems = 0;
    approvedItemsPerPage = 10;
    private readonly approvedRefreshTrigger = new Subject<void>();
    approvedDataSource = new MatTableDataSource<IMembershipAdmission>();
    filteredApprovedDataSource = new MatTableDataSource<IMembershipAdmission>();

    // State for Rejected tab
    rejectedIsLoading = true;
    rejectedTotalItems = 0;
    rejectedItemsPerPage = 10;
    private readonly rejectedRefreshTrigger = new Subject<void>();
    rejectedDataSource = new MatTableDataSource<IMembershipAdmission>();
    filteredRejectedDataSource = new MatTableDataSource<IMembershipAdmission>();

    // Search
    searchTerm = '';

    // Common columns for both tables
    displayedColumns: string[] = [
        'id',
        'fullName',
        'permanentAddress',
        'teleNo',
        'mobileNo',
        'email',
        'nic',
        'status',
        'actions'
    ];

    @ViewChild('submittedPaginator') submittedPaginator!: MatPaginator;
    @ViewChild('submittedSort') submittedSort!: MatSort;
    @ViewChild('approvedPaginator') approvedPaginator!: MatPaginator;
    @ViewChild('approvedSort') approvedSort!: MatSort;
    @ViewChild('rejectedPaginator') rejectedPaginator!: MatPaginator;
    @ViewChild('rejectedSort') rejectedSort!: MatSort;

    readonly applicationStatus = ApplicationStatus;

    ngOnInit(): void {
        // Initial data load will happen in ngAfterViewInit
    }

    ngAfterViewInit(): void {
        // Use setTimeout to ensure ViewChild references are available after view init
        setTimeout(() => {
            // Load Submitted data
            const submittedTriggers$ = merge(
                this.submittedSort?.sortChange ?? new Subject(),
                this.submittedPaginator?.page ?? new Subject(),
                this.submittedRefreshTrigger
            ).pipe(startWith({}));

            submittedTriggers$.subscribe(() => this.loadSubmittedData());

            // Load Approved data
            const approvedTriggers$ = merge(
                this.approvedSort?.sortChange ?? new Subject(),
                this.approvedPaginator?.page ?? new Subject(),
                this.approvedRefreshTrigger
            ).pipe(startWith({}));

            approvedTriggers$.subscribe(() => this.loadApprovedData());

            // Load Rejected data
            const rejectedTriggers$ = merge(
                this.rejectedSort?.sortChange ?? new Subject(),
                this.rejectedPaginator?.page ?? new Subject(),
                this.rejectedRefreshTrigger
            ).pipe(startWith({}));

            rejectedTriggers$.subscribe(() => this.loadRejectedData());

            // Initial load
            this.loadSubmittedData();
            this.loadApprovedData();
            this.loadRejectedData();
        });
    }

    loadSubmittedData(): void {
        this.submittedIsLoading = true;
        // Get all records and filter on frontend since backend filter is not working
        const req = {
            page: 0,
            size: 1000,
            sort: ['id,asc'],
        };

        this.membershipAdmissionService.query(req).pipe(
            tap(res => {
                this.submittedIsLoading = false;
                // Filter on frontend for SUBMITTED status
                const allData = res.body ?? [];
                const submittedData = allData.filter(item => item.status === ApplicationStatus.SUBMITTED);
                this.submittedTotalItems = submittedData.length;
                this.submittedDataSource.data = submittedData;
                this.applySearchFilter();
            }),
            catchError(() => {
                this.submittedIsLoading = false;
                return of(null);
            })
        ).subscribe();
    }

    loadApprovedData(): void {
        this.approvedIsLoading = true;
        // Get all records and filter on frontend since backend filter is not working
        const req = {
            page: 0,
            size: 1000,
            sort: ['id,asc'],
        };

        this.membershipAdmissionService.query(req).pipe(
            tap(res => {
                this.approvedIsLoading = false;
                // Filter on frontend for APPROVED status
                const allData = res.body ?? [];
                const approvedData = allData.filter(item => item.status === ApplicationStatus.APPROVED);
                this.approvedTotalItems = approvedData.length;
                this.approvedDataSource.data = approvedData;
                this.applySearchFilter();
            }),
            catchError(() => {
                this.approvedIsLoading = false;
                return of(null);
            })
        ).subscribe();
    }

    loadRejectedData(): void {
        this.rejectedIsLoading = true;
        // Get all records and filter on frontend since backend filter is not working
        const req = {
            page: 0,
            size: 1000,
            sort: ['id,asc'],
        };

        this.membershipAdmissionService.query(req).pipe(
            tap(res => {
                this.rejectedIsLoading = false;
                // Filter on frontend for REJECTED status
                const allData = res.body ?? [];
                const rejectedData = allData.filter(item => item.status === ApplicationStatus.REJECTED);
                this.rejectedTotalItems = rejectedData.length;
                this.rejectedDataSource.data = rejectedData;
                this.applySearchFilter();
            }),
            catchError(() => {
                this.rejectedIsLoading = false;
                return of(null);
            })
        ).subscribe();
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
        // Filter Submitted data
        if (!this.searchTerm) {
            this.filteredSubmittedDataSource.data = [...this.submittedDataSource.data];
        } else {
            this.filteredSubmittedDataSource.data = this.submittedDataSource.data.filter(item =>
                item.fullName?.toLowerCase().includes(this.searchTerm)
            );
        }
        this.submittedTotalItems = this.filteredSubmittedDataSource.data.length;

        // Filter Approved data
        if (!this.searchTerm) {
            this.filteredApprovedDataSource.data = [...this.approvedDataSource.data];
        } else {
            this.filteredApprovedDataSource.data = this.approvedDataSource.data.filter(item =>
                item.fullName?.toLowerCase().includes(this.searchTerm)
            );
        }
        this.approvedTotalItems = this.filteredApprovedDataSource.data.length;

        // Filter Rejected data
        if (!this.searchTerm) {
            this.filteredRejectedDataSource.data = [...this.rejectedDataSource.data];
        } else {
            this.filteredRejectedDataSource.data = this.rejectedDataSource.data.filter(item =>
                item.fullName?.toLowerCase().includes(this.searchTerm)
            );
        }
        this.rejectedTotalItems = this.filteredRejectedDataSource.data.length;
    }

    getSubmittedSortParameters(): string[] {
        if (!this.submittedSort || !this.submittedSort.active || this.submittedSort.direction === '') {
            return ['id,asc'];
        }
        return [`${this.submittedSort.active},${this.submittedSort.direction}`];
    }

    getApprovedSortParameters(): string[] {
        if (!this.approvedSort || !this.approvedSort.active || this.approvedSort.direction === '') {
            return ['id,asc'];
        }
        return [`${this.approvedSort.active},${this.approvedSort.direction}`];
    }

    getRejectedSortParameters(): string[] {
        if (!this.rejectedSort || !this.rejectedSort.active || this.rejectedSort.direction === '') {
            return ['id,asc'];
        }
        return [`${this.rejectedSort.active},${this.rejectedSort.direction}`];
    }

    openVerifyDialog(id: number, fromTab: 'submitted' | 'approved'): void {
        const dialogRef = this.dialog.open(ViewApprovalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { membershipAdmissionId: id, fromTab } as ViewApprovalDialogData,
        });

        dialogRef.afterClosed().subscribe((result: ViewApprovalDialogResult | undefined) => {
            if (result?.status === 'approved' || result?.status === 'rejected') {
                this.submittedRefreshTrigger.next();
                this.approvedRefreshTrigger.next();
                this.rejectedRefreshTrigger.next();
                this.loadSubmittedData();
                this.loadApprovedData();
                this.loadRejectedData();
            }
        });
    }

    refreshAll(): void {
        this.submittedRefreshTrigger.next();
        this.approvedRefreshTrigger.next();
        this.rejectedRefreshTrigger.next();
        this.loadSubmittedData();
        this.loadApprovedData();
        this.loadRejectedData();
    }
    
}
