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
import { ICourse } from '../../course/course.model';
import { CourseService } from '../../course/service/course.service';
import { ICourseCoordinator } from '../../course-coordinator/course-coordinator.model';
import { CourseCoordinatorService } from '../../course-coordinator/service/course-coordinator.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    private courseService = inject(CourseService);
    private courseCoordinatorService = inject(CourseCoordinatorService);

    courseAdmission: ICourseAdmission | null = null;
    invoices: IInvoice[] = [];
    registrationNumber: string | null = null;
    isLoading = true;

    ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        this.isLoading = true;
        const admission$ = this.courseAdmissionService.find(this.data.courseAdmissionId);
        admission$.pipe(
            switchMap(admissionResponse => {
                this.courseAdmission = admissionResponse.body;
                const course$ = this.courseAdmission?.courseRefId ? this.courseService.find(this.courseAdmission.courseRefId) : of(null);
                const invoices$ = this.invoiceService.query({ 'courseAdmissionId.equals': this.data.courseAdmissionId });
                return forkJoin([course$, invoices$]);
            }),
            switchMap(([courseResponse, invoicesResponse]) => {
                if (courseResponse && this.courseAdmission) {
                    this.courseAdmission.courseRef = courseResponse.body;
                }
                this.invoices = invoicesResponse.body || [];
                // Find registration number from invoices
                for (const invoice of this.invoices) {
                    if (invoice.registrationNumber) {
                        this.registrationNumber = invoice.registrationNumber;
                        break;
                    }
                }
                // Load coordinator if exists
                const coordinator$ = this.courseAdmission?.courseRef?.coordinator?.id
                    ? this.courseCoordinatorService.find(this.courseAdmission.courseRef.coordinator.id)
                    : of(null);
                return coordinator$;
            })
        ).subscribe({
            next: (coordinatorResponse) => {
                if (coordinatorResponse && this.courseAdmission?.courseRef) {
                    this.courseAdmission.courseRef.coordinator = coordinatorResponse.body as any;
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