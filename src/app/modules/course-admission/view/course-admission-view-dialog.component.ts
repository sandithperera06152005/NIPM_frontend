import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CourseAdmissionService } from '../service/course-admission.service';
import { InvoiceService } from '../../invoice/service/invoice.service';
import { ICourseAdmission } from '../course-admission.model';
import { IInvoice } from '../../invoice/invoice.model';
import { forkJoin } from 'rxjs';

interface DialogData {
    courseAdmissionId: number;
}

@Component({
    selector: 'app-course-admission-view-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
    ],
    templateUrl: './course-admission-view-dialog.component.html',
    styles: [`
      .mat-mdc-dialog-container .mat-mdc-dialog-surface {
        max-height: 95vh !important;
        max-width: 95vw !important;
      }
    `],
})
export class CourseAdmissionViewDialogComponent implements OnInit {
    private dialogRef = inject(MatDialogRef<CourseAdmissionViewDialogComponent>);
    private data = inject(MAT_DIALOG_DATA) as DialogData;
    private courseAdmissionService = inject(CourseAdmissionService);
    private invoiceService = inject(InvoiceService);

    courseAdmission: ICourseAdmission | null = null;
    invoices: IInvoice[] = [];
    registrationNumber: string | null = null;
    isLoading = true;

    ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        this.isLoading = true;

        // Fetch course admission details
        const admission$ = this.courseAdmissionService.find(this.data.courseAdmissionId);

        // Fetch invoices for this admission
        const invoices$ = this.invoiceService.query({ 'courseAdmissionId.equals': this.data.courseAdmissionId });

        forkJoin([admission$, invoices$]).subscribe({
            next: ([admissionResponse, invoicesResponse]) => {
                this.courseAdmission = admissionResponse.body;

                this.invoices = invoicesResponse.body || [];

                // Find registration number from invoices
                for (const invoice of this.invoices) {
                    if (invoice.registrationNumber) {
                        this.registrationNumber = invoice.registrationNumber;
                        break;
                    }
                }

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load data', err);
                this.isLoading = false;
            }
        });
    }
}