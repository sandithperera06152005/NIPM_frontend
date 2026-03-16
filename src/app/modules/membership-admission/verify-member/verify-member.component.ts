import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { IMembershipAdmission } from '../membership-admission.model';
import { MembershipAdmissionService } from '../service/membership-admission.service';
import { ApplicationStatus } from '../../../enums/application-status.model';

export interface VerifyMemberDialogData {
    membershipAdmissionId: number;
}

export interface VerifyMemberDialogResult {
    status: 'approved' | 'rejected' | 'payment_email_sent';
}

@Component({
    selector: 'app-verify-member',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    templateUrl: './verify-member.component.html',
})
export class VerifyMemberComponent implements OnInit {
    private readonly membershipAdmissionService = inject(MembershipAdmissionService);
    private readonly snackBar = inject(MatSnackBar);

    membershipAdmission: IMembershipAdmission | null = null;
    isLoading = true;
    isSendingEmail = false;

    readonly applicationStatus = ApplicationStatus;

    constructor(
        public dialogRef: MatDialogRef<VerifyMemberComponent>,
        @Inject(MAT_DIALOG_DATA) public data: VerifyMemberDialogData
    ) { }

    ngOnInit(): void {
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

    sendForApproval(): void {
        if (!this.membershipAdmission) return;

        // Create a complete copy of the membership admission with updated status
        const updatedData: IMembershipAdmission = {
            ...this.membershipAdmission,
            status: ApplicationStatus.SUBMITTED,
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

    // Check if the member is approved (ready for payment email)
    get canSendPaymentEmail(): boolean {
        return this.membershipAdmission?.status === ApplicationStatus.APPROVED;
    }

    sendPaymentEmail(): void {
        if (!this.membershipAdmission || this.isSendingEmail) return;

        this.isSendingEmail = true;

        this.membershipAdmissionService.sendPaymentEmail(this.membershipAdmission.id!).subscribe({
            next: () => {
                this.isSendingEmail = false;
                this.snackBar.open('Payment email sent successfully!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                this.dialogRef.close({ status: 'payment_email_sent' as const });
            },
            error: () => {
                this.isSendingEmail = false;
                this.snackBar.open('Failed to send payment email. Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            },
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
