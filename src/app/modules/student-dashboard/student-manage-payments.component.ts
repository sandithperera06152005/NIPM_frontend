import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DocumentService } from 'app/entities/document/service/document.service';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import dayjs from 'dayjs/esm';

import { IInvoice } from '../invoice/invoice.model';
import { InvoiceService } from '../invoice/service/invoice.service';
import { AccountService } from 'app/core/auth/account.service';
import { CourseAdmissionService } from '../course-admission/service/course-admission.service';
import { ICourseAdmission } from '../course-admission/course-admission.model';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { IPayment, NewPayment } from 'app/entities/payment/payment.model';
import { PaymentMethod } from 'app/enums/payment-method.model';
import { PaymentStatus } from 'app/enums/payment-status.model';

@Component({
    selector: 'app-student-manage-payments',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
    ],
    templateUrl: './student-manage-payments.component.html',
    styleUrl: './student-manage-payments.component.scss',
})
export class StudentManagePaymentsComponent implements OnInit {
    private readonly invoiceService = inject(InvoiceService);
    private readonly accountService = inject(AccountService);
    private readonly documentService = inject(DocumentService);
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly paymentService = inject(PaymentService);

    invoices: IInvoice[] = [];
    isLoading = true;

    @ViewChild(MatSort) sort!: MatSort;
    displayedColumns: string[] = [
        'id',
        'invoiceNo',
        'issuedDate',
        'dueDate',
        'totalAmount',
        'paidAmount',
        'outstandingAmount',
        'savePayment',
        'receivedDocument',
    ];
    dataSource = new MatTableDataSource<IInvoice>();

    paymentAmounts: Record<number, number | null | undefined> = {};
    savingInvoiceIds = new Set<number>();
    selectedReceiptFiles: Record<number, File | null | undefined> = {};
    uploadingReceiptInvoiceIds = new Set<number>();
    paymentIdByInvoiceId: Record<number, number | null | undefined> = {};

    ngOnInit(): void {
        this.loadStudentPayments();
    }

    savePaidAmount(invoice: IInvoice): void {
        if (!invoice.id) {
            alert('Invoice ID is missing.');
            return;
        }

        const id = invoice.id;
        const raw = this.paymentAmounts[id];
        const amount = typeof raw === 'number' ? raw : Number(raw);

        if (!Number.isFinite(amount) || amount < 0) {
            alert('Please enter a valid amount.');
            return;
        }

        this.savingInvoiceIds.add(id);
        this.ensurePaymentForInvoice(id, amount).pipe(
            switchMap(() => this.invoiceService.find(id)),
            switchMap(res => {
                const full = res.body;
                if (!full) throw new Error('Invoice not found');
                full.paidAmount = amount;
                return this.invoiceService.update(full);
            }),
            catchError(err => {
                console.error('Failed to update invoice paid amount', err);
                alert('Failed to save paid amount.');
                return of(null);
            })
        ).subscribe(updated => {
            this.savingInvoiceIds.delete(id);
            if (updated?.body) {
                invoice.paidAmount = updated.body.paidAmount;
                this.dataSource._updateChangeSubscription();
                alert('Paid amount saved.');
            }
        });
    }

    onReceiptSelected(invoice: IInvoice, event: Event): void {
        if (!invoice.id) {
            return;
        }
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedReceiptFiles[invoice.id] = input.files[0];
        }
    }

    uploadReceipt(invoice: IInvoice): void {
        if (!invoice.id) {
            alert('Invoice ID is missing.');
            return;
        }

        const invoiceId = invoice.id;
        const file = this.selectedReceiptFiles[invoiceId];
        if (!file) {
            alert('Please choose a receipt file first.');
            return;
        }

        const rawAmount = this.paymentAmounts[invoiceId];
        const amount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
        if (!Number.isFinite(amount) || amount < 0) {
            alert('Please enter a valid paid amount before uploading the receipt.');
            return;
        }

        this.uploadingReceiptInvoiceIds.add(invoiceId);
        this.ensurePaymentForInvoice(invoiceId, amount).pipe(
            switchMap(paymentId => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('documentType', 'BANK_SLIP');
                formData.append('paymentId', String(paymentId));
                return this.documentService.upload(formData);
            }),
            switchMap(() => this.documentService.getDocumentsByInvoiceId(invoiceId)),
            catchError(err => {
                console.error('Failed to upload receipt', err);
                alert('Failed to upload receipt.');
                return of(null);
            })
        ).subscribe(docs => {
            this.uploadingReceiptInvoiceIds.delete(invoiceId);
            if (docs) {
                invoice.documents = docs;
                this.selectedReceiptFiles[invoiceId] = null;
                this.dataSource._updateChangeSubscription();
                alert('Receipt uploaded.');
            }
        });
    }

    private ensurePaymentForInvoice(invoiceId: number, amount: number) {
        const existingPaymentId = this.paymentIdByInvoiceId[invoiceId];
        if (existingPaymentId) {
            return of(existingPaymentId);
        }

        return this.paymentService.query({ 'invoiceId.equals': invoiceId }).pipe(
            map(res => res.body ?? []),
            switchMap((payments: IPayment[]) => {
                const existing = payments[0];
                if (existing?.id) {
                    this.paymentIdByInvoiceId[invoiceId] = existing.id;
                    return of(existing.id);
                }

                const payload: NewPayment = {
                    id: null,
                    invoiceId,
                    amount,
                    paymentMethod: PaymentMethod.BANK_TRANSFER,
                    paymentStatus: PaymentStatus.PENDING,
                    paymentDate: dayjs(),
                    referenceNumber: null,
                };

                return this.paymentService.create(payload).pipe(
                    map(created => {
                        const newId = created.body?.id;
                        if (!newId) {
                            throw new Error('Payment create failed');
                        }
                        this.paymentIdByInvoiceId[invoiceId] = newId;
                        return newId;
                    })
                );
            })
        );
    }

    loadStudentPayments(): void {
        this.accountService.identity().subscribe(account => {
            if (account?.login) {
                const login = account.login;
                const email = (account as any).email as string | undefined;

                // Step 1: Resolve course admission for the logged-in user (by NIC, then email).
                const byNic$ = this.courseAdmissionService.query({ 'nic.equals': login }).pipe(map(res => res.body || []));
                const byEmail$ = email ? this.courseAdmissionService.query({ 'email.equals': email }).pipe(map(res => res.body || [])) : of([]);

                byNic$.pipe(
                    switchMap(courseAdmissions => (courseAdmissions.length > 0 ? of(courseAdmissions) : byEmail$)),
                    switchMap(courseAdmissions => {
                        if (courseAdmissions.length === 0) {
                            return of([] as IInvoice[]);
                        }

                        const courseAdmissionId = courseAdmissions[0].id;
                        if (!courseAdmissionId) {
                            return of([] as IInvoice[]);
                        }

                        // Step 2: Validate the course admission exists and belongs to this user (NIC or email match).
                        return this.courseAdmissionService.find(courseAdmissionId).pipe(
                            map(res => res.body as ICourseAdmission | null),
                            switchMap(courseAdmission => {
                                const nicMatches = !!courseAdmission?.nic && courseAdmission.nic === login;
                                const emailMatches = !!email && !!courseAdmission?.email && courseAdmission.email === email;

                                if (!courseAdmission || (!nicMatches && !emailMatches)) {
                                    return of([] as IInvoice[]);
                                }

                                // Step 3: Query invoices for this validated course admission.
                                // Prefer `courseAdmissionId.equals` and fall back to nested filter for compatibility.
                                return this.invoiceService.query({ 'courseAdmissionId.equals': courseAdmissionId }).pipe(
                                    map(r => r.body || []),
                                    switchMap(invoices =>
                                        invoices.length > 0
                                            ? of(invoices)
                                            : this.invoiceService.query({ 'courseAdmission.id.equals': courseAdmissionId }).pipe(map(rr => rr.body || []))
                                    )
                                );
                            })
                        );
                    }),
                    switchMap((invoices: IInvoice[]) => {
                        this.invoices = invoices.sort((a, b) => {
                            const getNum = (inv: string) => (inv.match(/-(\d+)$/) ? parseInt(inv.match(/-(\d+)$/)![1], 10) : 0);
                            return getNum(a.invoiceNo || '') - getNum(b.invoiceNo || '');
                        });

                        // Initialize editable payment amounts
                        this.invoices.forEach(inv => {
                            if (inv.id != null && this.paymentAmounts[inv.id] === undefined) {
                                this.paymentAmounts[inv.id] = inv.paidAmount ?? 0;
                            }
                            if (inv.id != null && this.selectedReceiptFiles[inv.id] === undefined) {
                                this.selectedReceiptFiles[inv.id] = null;
                            }
                            if (inv.id != null && this.paymentIdByInvoiceId[inv.id] === undefined) {
                                this.paymentIdByInvoiceId[inv.id] = null;
                            }
                        });

                        if (this.invoices.length > 0) {
                            // Load documents for all invoices
                            const docCalls = this.invoices.map(invoice =>
                                invoice.id
                                    ? this.documentService.getDocumentsByInvoiceId(invoice.id).pipe(
                                        map(docs => { invoice.documents = docs; }),
                                        catchError(() => of(null))
                                    )
                                    : of(null)
                            );
                            return forkJoin(docCalls);
                        } else {
                            return of(null);
                        }
                    }),
                    catchError(() => {
                        this.invoices = [];
                        return of(null);
                    })
                ).subscribe(() => {
                    this.dataSource.data = this.invoices;
                    this.dataSource.sort = this.sort;
                    this.isLoading = false;
                });
            } else {
                this.isLoading = false;
            }
        });
    }

}