import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MembershipAdmissionFormGroup, MembershipAdmissionFormService } from '../update/membership-admission-form.service';
import { MembershipAdmissionService } from '../service/membership-admission.service';
import { IMembershipAdmission, NewMembershipAdmission } from '../membership-admission.model';
import { ApplicationStatus } from '../../../enums/application-status.model';

import { AccountService } from 'app/core/auth/account.service';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { DocumentService } from 'app/entities/document/service/document.service';
import { PaymentMethod } from 'app/enums/payment-method.model';
import { PaymentStatus } from 'app/enums/payment-status.model';
import { IPayment, NewPayment } from 'app/entities/payment/payment.model';

import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';

@Component({
    selector: 'app-membership-form',
    standalone: true,
    templateUrl: './membership-form.component.html',
    styleUrls: ['./membership-form.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatCardModule,
        MatExpansionModule,
        RouterModule,
        MatSnackBarModule,
    ],
})
export class MembershipFormComponent implements OnInit {
    form!: MembershipAdmissionFormGroup;
    isSaving = false;
    errorMessage: string | null = null;
    isLoadingMember = false;
    showSuccess = false;

    readonly applicationStatusOptions = Object.keys(ApplicationStatus);
    readonly paymentMethods = Object.keys(PaymentMethod);

    // For file upload
    selectedFile: File | null = null;

    // To store current membership ID if exists
    currentMembershipId: number | null = null;

    private readonly membershipAdmissionService = inject(MembershipAdmissionService);
    private readonly formService = inject(MembershipAdmissionFormService);
    private readonly accountService = inject(AccountService);
    private readonly paymentService = inject(PaymentService);
    private readonly documentService = inject(DocumentService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly route = inject(ActivatedRoute);

    ngOnInit(): void {
        this.form = this.formService.createMembershipAdmissionFormGroup();

        // Add payment form controls to the main form (cast to FormGroup to allow dynamic controls)
        (this.form as unknown as FormGroup).addControl('paymentMethod', new FormControl<string | null>(null));
        (this.form as unknown as FormGroup).addControl('amount', new FormControl<number | null>(null));
        (this.form as unknown as FormGroup).addControl('referenceNumber', new FormControl<string | null>(null));

        // Check if we have an ID in the route (editing existing membership from email link)
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            const membershipId = parseInt(idParam, 10);
            if (!isNaN(membershipId)) {
                this.loadMembershipById(membershipId);
                return;
            }
        }

        // Otherwise try to load by logged-in user's email
        this.loadCurrentUserMembership();
    }

    /**
     * Load membership by ID from route parameter
     */
    private loadMembershipById(id: number): void {
        this.isLoadingMember = true;
        console.log('Loading membership by ID:', id);

        this.membershipAdmissionService.find(id).subscribe({
            next: (res) => {
                this.isLoadingMember = false;
                const membership = res.body;
                console.log('Membership loaded:', membership);

                if (membership) {
                    this.currentMembershipId = membership.id ?? null;
                    this.formService.resetForm(this.form, membership);

                    this.snackBar.open('Your membership details have been loaded', 'Close', {
                        duration: 3000,
                    });
                }
            },
            error: (err) => {
                this.isLoadingMember = false;
                console.error('Error loading membership:', err);
                this.snackBar.open('Unable to load membership details', 'Close', {
                    duration: 5000,
                });
            }
        });
    }

    /**
     * Load the current logged-in user's membership data if it exists
     */
    private loadCurrentUserMembership(): void {
        const account = this.accountService.trackCurrentAccount()();

        if (!account) {
            // If no account is logged in, try to get it from the identity
            this.accountService.identity().subscribe({
                next: (acc) => {
                    if (acc?.email) {
                        this.queryMembershipByEmail(acc.email);
                    }
                },
                error: () => {
                    console.warn('Unable to get account information');
                }
            });
        } else if (account.email) {
            this.queryMembershipByEmail(account.email);
        }
    }

    /**
     * Query membership by user's email
     */
    private queryMembershipByEmail(email: string): void {
        this.isLoadingMember = true;

        this.membershipAdmissionService.query({ 'email.equals': email }).subscribe({
            next: (res) => {
                this.isLoadingMember = false;
                const memberships = res.body;

                if (memberships && memberships.length > 0) {
                    // Get the most recent membership
                    const membership = memberships[0];
                    this.currentMembershipId = membership.id ?? null;

                    // Populate form with existing data
                    this.formService.resetForm(this.form, membership);

                    // Show a message that existing data was loaded
                    this.snackBar.open('Your membership details have been loaded', 'Close', {
                        duration: 3000,
                    });
                }
            },
            error: () => {
                this.isLoadingMember = false;
                console.warn('Unable to load membership data');
            }
        });
    }

    /**
     * Handle file selection for bank slip upload
     */
    onSlipSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    /**
     * Upload the receipt file and return the URL
     */
    private uploadReceiptFile(paymentId: number): void {
        if (!this.selectedFile) return;

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('documentType', 'BANK_SLIP');
        formData.append('paymentId', paymentId.toString());

        this.documentService.upload(formData).subscribe({
            next: (response) => {
                console.log('Receipt uploaded successfully:', response);
            },
            error: () => {
                console.error('Failed to upload receipt');
                this.snackBar.open('Payment saved but failed to upload receipt', 'Close', {
                    duration: 5000,
                });
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage = null;
        this.isSaving = true;

        const payload = this.formService.getMembershipAdmission(this.form);

        // Get payment details from form (cast to access dynamic controls)
        const paymentMethod = (this.form as unknown as FormGroup).get('paymentMethod')?.value;
        const amount = (this.form as unknown as FormGroup).get('amount')?.value;
        const referenceNumber = (this.form as unknown as FormGroup).get('referenceNumber')?.value;

        // If membership already exists, update it; otherwise create new
        const membershipObservable = this.currentMembershipId
            ? this.membershipAdmissionService.update({ ...payload, id: this.currentMembershipId } as IMembershipAdmission)
            : this.membershipAdmissionService.create({
                ...payload,
                status: ApplicationStatus.SUBMITTED
            } as NewMembershipAdmission);

        membershipObservable.subscribe({
            next: (membershipRes) => {
                const membershipId = membershipRes.body?.id;

                if (!membershipId) {
                    this.isSaving = false;
                    this.errorMessage = 'Failed to save membership';
                    return;
                }

                // If payment details are provided, save them
                if (paymentMethod && amount) {
                    const payment: NewPayment = {
                        id: null,
                        memberID: membershipId,
                        paymentMethod: paymentMethod,
                        amount: amount,
                        referenceNumber: referenceNumber,
                        paymentDate: dayjs(),
                        paymentStatus: PaymentStatus.PENDING,
                        membershipAdmission: { id: membershipId }
                    };

                    this.paymentService.create(payment).subscribe({
                        next: (paymentRes) => {
                            const paymentId = paymentRes.body?.id;

                            // Upload receipt if file selected
                            if (paymentId && this.selectedFile) {
                                this.uploadReceiptFile(paymentId);
                            }

                            this.isSaving = false;
                            // Show success message instead of reloading
                            this.showSuccess = true;
                        },
                        error: () => {
                            this.isSaving = false;
                            this.snackBar.open('Membership saved but payment failed to save', 'Close', {
                                duration: 5000,
                            });
                            window.location.reload();
                        }
                    });
                } else {
                    this.isSaving = false;
                    // Show success message instead of reloading
                    this.showSuccess = true;
                }
            },
            error: () => {
                this.isSaving = false;
                this.errorMessage = 'Unable to save record. Please try again.';
            },
        });
    }

    printForm(): void {
        window.print();
    }

    goBackToForm(): void {
        this.showSuccess = false;
    }
}
