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
    ],
    templateUrl: './student-profile-view.component.html',
    styleUrl: './student-profile-view.component.scss',
})
export class StudentProfileViewComponent implements OnInit {
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly accountService = inject(AccountService);
    private readonly dialog = inject(MatDialog);

    courseAdmission: ICourseAdmission | null = null;
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
            const dialogRef = this.dialog.open(CourseAdmissionFormComponent, {
                data: { courseAdmission: this.courseAdmission },
                width: '90vw',
                maxWidth: '1200px',
                height: '90vh',
                maxHeight: '95vh',
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loadStudentProfile();
                }
            });
        }
    }
}