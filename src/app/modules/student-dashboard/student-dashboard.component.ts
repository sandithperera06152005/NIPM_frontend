import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ICourseAdmission } from '../course-admission/course-admission.model';
import { CourseAdmissionService } from '../course-admission/service/course-admission.service';
import { AccountService } from 'app/core/auth/account.service';
import { ICourse } from '../course/course.model';
import { CourseService } from '../course/service/course.service';
import { ICourseCoordinator } from '../course-coordinator/course-coordinator.model';
import { CourseCoordinatorService } from '../course-coordinator/service/course-coordinator.service';
import { IInvoice } from '../invoice/invoice.model';
import { InvoiceService } from '../invoice/service/invoice.service';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './student-dashboard.component.html',
    styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly accountService = inject(AccountService);
    private readonly courseService = inject(CourseService);
    private readonly courseCoordinatorService = inject(CourseCoordinatorService);
    private readonly invoiceService = inject(InvoiceService);

    courseAdmission: ICourseAdmission | null = null;
    course: ICourse | null = null;
    coordinator: ICourseCoordinator | null = null;
    registrationNumber: string | null = null;
    isLoading = true;

    ngOnInit(): void {
        this.loadStudentData();
    }

    loadStudentData(): void {
        this.accountService.identity().subscribe(account => {
            console.log('Account:', account);
            if (account?.login) {
                const email = account.email;
                console.log('Fetching admission for email:', email);
                // Fetch course admission by email
                this.courseAdmissionService.query({ page: 0, size: 10, 'email.equals': email }).subscribe(response => {
                    console.log('Admission response:', response);
                    if (response.body && response.body.length > 0) {
                        this.courseAdmission = response.body[0];
                        this.loadRegistrationNumber();
                        this.loadCourseDetails();
                    } else {
                        this.isLoading = false;
                    }
                });
            } else {
                this.isLoading = false;
            }
        });
    }

    loadCourseDetails(): void {
        if (this.courseAdmission?.courseRefId) {
            this.courseService.find(this.courseAdmission.courseRefId).subscribe(response => {
                if (response.body) {
                    this.course = response.body;
                    this.loadCoordinatorDetails();
                } else {
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    loadCoordinatorDetails(): void {
        if (this.course?.coordinator?.id) {
            this.courseCoordinatorService.find(this.course.coordinator.id).subscribe(response => {
                if (response.body) {
                    this.coordinator = response.body;
                }
                this.isLoading = false;
            });
        } else {
            this.isLoading = false;
        }
    }

    loadRegistrationNumber(): void {
        if (this.courseAdmission?.id) {
            console.log('Fetching invoices for courseAdmissionId:', this.courseAdmission.id);
            this.invoiceService.query({ 'courseAdmissionId.equals': this.courseAdmission.id }).subscribe(response => {
                console.log('Invoice query response:', response);
                if (response.body && response.body.length > 0) {
                    // Find the first invoice with a registration number
                    for (const invoice of response.body) {
                        if (invoice.registrationNumber) {
                            this.registrationNumber = invoice.registrationNumber;
                            console.log('Registration number found:', this.registrationNumber);
                            break;
                        }
                    }
                    if (!this.registrationNumber) {
                        console.log('No registration number found in any invoice');
                    }
                } else {
                    console.log('No invoices found for this course admission');
                }
            });
        }
    }
}