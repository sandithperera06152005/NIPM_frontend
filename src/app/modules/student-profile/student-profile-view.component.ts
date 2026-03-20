import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ICourseAdmission } from '../course-admission/course-admission.model';
import { CourseAdmissionService } from '../course-admission/service/course-admission.service';
import { AccountService } from 'app/core/auth/account.service';
import { CourseAdmissionFormComponent } from '../course-admission/form/course-admission-form.component';
import { ICourse } from '../course/course.model';
import { CourseService } from '../course/service/course.service';
import { IInvoice } from '../invoice/invoice.model';
import { InvoiceService } from '../invoice/service/invoice.service';

@Component({
    selector: 'app-student-profile-view',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        CourseAdmissionFormComponent,
    ],
    templateUrl: './student-profile-view.component.html',
    styleUrl: './student-profile-view.component.scss',
})
export class StudentProfileViewComponent implements OnInit {
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly accountService = inject(AccountService);
    private readonly courseService = inject(CourseService);
    private readonly invoiceService = inject(InvoiceService);
    private readonly dialog = inject(MatDialog);

    courseAdmission: ICourseAdmission | null = null;
    registrationNumber: string | null = null;
    isLoading = true;
    isEditing = false;

    ngOnInit(): void {
        this.loadStudentProfile();
    }

    loadStudentProfile(): void {
        this.accountService.identity().subscribe(account => {
            if (account?.email) {
                this.courseAdmissionService.query({ 'email.equals': account.email }).subscribe(response => {
                    if (response.body && response.body.length > 0) {
                        this.courseAdmission = response.body[0];
                        // If courseRef is not loaded but courseRefId exists, fetch the course
                        if (this.courseAdmission && this.courseAdmission.courseRefId && !this.courseAdmission.courseRef) {
                            this.courseService.find(this.courseAdmission.courseRefId).subscribe(courseResponse => {
                                if (courseResponse.body) {
                                    this.courseAdmission!.courseRef = courseResponse.body;
                                }
                            });
                        }
                        // Fetch the registration number from invoices
                        if (this.courseAdmission && this.courseAdmission.id) {
                            this.invoiceService.query({ 'courseAdmissionId.equals': this.courseAdmission.id }).subscribe(invoiceResponse => {
                                if (invoiceResponse.body && invoiceResponse.body.length > 0) {
                                    this.registrationNumber = invoiceResponse.body[0].registrationNumber || null;
                                }
                            });
                        }
                    }
                    this.isLoading = false;
                });
            } else {
                this.isLoading = false;
            }
        });
    }

    editProfile(): void {
        if (this.courseAdmission) {
            this.isEditing = true;
        }
    }

    onSaveSuccess(): void {
        this.isEditing = false;
        this.loadStudentProfile();
    }
}