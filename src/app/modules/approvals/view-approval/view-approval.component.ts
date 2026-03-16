import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IMembershipAdmission } from '../../membership-admission/membership-admission.model';
import { MembershipAdmissionService } from '../../membership-admission/service/membership-admission.service';
import { ApplicationStatus } from '../../../enums/application-status.model';

export interface ViewApprovalDialogData {
    membershipAdmissionId: number;
    fromTab: 'submitted' | 'approved';
}

export interface ViewApprovalDialogResult {
    status: 'approved' | 'rejected';
}

@Component({
    selector: 'app-view-approval',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './view-approval.component.html',
})
export class ViewApprovalComponent implements OnInit {
    private readonly membershipAdmissionService = inject(MembershipAdmissionService);

    membershipAdmission: IMembershipAdmission | null = null;
    isLoading = true;
    fromTab: 'submitted' | 'approved' = 'submitted';

    readonly applicationStatus = ApplicationStatus;

    constructor(
        public dialogRef: MatDialogRef<ViewApprovalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ViewApprovalDialogData
    ) { }

    ngOnInit(): void {
        this.fromTab = this.data.fromTab || 'submitted';
        this.loadMembershipAdmission();
    }

    loadMembershipAdmission(): void {
        this.membershipAdmissionService.find(this.data.membershipAdmissionId).subscribe({
            next: (response) => {
                this.membershipAdmission = response.body;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    approve(): void {
        if (!this.membershipAdmission) return;

        // Create a complete copy of the membership admission with updated status to APPROVED
        const updatedData: IMembershipAdmission = {
            ...this.membershipAdmission,
            status: ApplicationStatus.APPROVED,
        };

        this.membershipAdmissionService.update(updatedData).subscribe({
            next: () => {
                this.dialogRef.close({ status: 'approved' as const });
            },
            error: () => {
                // Handle error
            },
        });
    }

    reject(): void {
        if (!this.membershipAdmission) return;

        // Create a complete copy of the membership admission with updated status to REJECTED
        const updatedData: IMembershipAdmission = {
            ...this.membershipAdmission,
            status: ApplicationStatus.REJECTED,
        };

        this.membershipAdmissionService.update(updatedData).subscribe({
            next: () => {
                this.dialogRef.close({ status: 'rejected' as const });
            },
            error: () => {
                // Handle error
            },
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
