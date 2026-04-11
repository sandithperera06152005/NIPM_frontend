import { Component, Inject, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { IMembershipAdmission } from '../membership-admission.model';
import { IMembershipCategory } from '../../membership-category/membership-category.model';
import { MembershipAdmissionService } from '../service/membership-admission.service';
import { MembershipCategoryService } from '../../membership-category/service/membership-category.service';
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
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            .verify-member-dialog-panel .mat-mdc-dialog-surface,
            .verify-member-dialog-panel .mdc-dialog__surface {
                overflow: hidden;
            }

            .verify-member-dialog-panel .mat-mdc-dialog-container,
            .verify-member-dialog-panel .mat-mdc-dialog-container .mdc-dialog__container {
                height: 100%;
            }
        `,
    ],
})
export class VerifyMemberComponent implements OnInit {
    private readonly membershipAdmissionService = inject(MembershipAdmissionService);
    private readonly membershipCategoryService = inject(MembershipCategoryService);
    private readonly snackBar = inject(MatSnackBar);

    membershipAdmission: IMembershipAdmission | null = null;
    membershipCategory: IMembershipCategory | null = null;
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
                const categoryId = this.membershipAdmission?.membershipCategory?.id || this.membershipAdmission?.membershipCategoryId;
                if (categoryId) {
                    this.loadMembershipCategory(categoryId);
                } else {
                    this.isLoading = false;
                }
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    loadMembershipCategory(categoryId: number): void {
        this.membershipCategoryService.find(categoryId).subscribe({
            next: (response) => {
                this.membershipCategory = response.body;
                this.isLoading = false;
            },
            error: () => {
                this.membershipCategory = null;
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
