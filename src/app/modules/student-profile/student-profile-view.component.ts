import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ICourseAdmission } from '../course-admission/course-admission.model';
import { CourseAdmissionService } from '../course-admission/service/course-admission.service';
import { AccountService } from 'app/core/auth/account.service';
import { ICourse } from '../course/course.model';
import { CourseService } from '../course/service/course.service';
import { IInvoice } from '../invoice/invoice.model';
import { InvoiceService } from '../invoice/service/invoice.service';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IAdvancedLevelQualification } from 'app/entities/advanced-level-qualification/advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { IAdvancedLevelSubject } from 'app/entities/advanced-level-subject/advanced-level-subject.model';
import { AdvancedLevelSubjectService } from 'app/entities/advanced-level-subject/service/advanced-level-subject.service';
import { IDiplomaQualification } from 'app/entities/diploma-qualification/diploma-qualification.model';
import { DiplomaQualificationService } from 'app/entities/diploma-qualification/service/diploma-qualification.service';
import { IIndustryExperience } from 'app/entities/industry-experience/industry-experience.model';
import { IndustryExperienceService } from 'app/entities/industry-experience/service/industry-experience.service';
import { IEmployment } from 'app/entities/employment/employment.model';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { StudentProfileEditComponent } from './student-profile-edit.component';

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
        StudentProfileEditComponent,
    ],
    templateUrl: './student-profile-view.component.html',
    styleUrl: './student-profile-view.component.scss',
})
export class StudentProfileViewComponent implements OnInit {
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly accountService = inject(AccountService);
    private readonly courseService = inject(CourseService);
    private readonly invoiceService = inject(InvoiceService);
    private readonly applicantService = inject(ApplicantService);
    private readonly advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
    private readonly advancedLevelSubjectService = inject(AdvancedLevelSubjectService);
    private readonly diplomaQualificationService = inject(DiplomaQualificationService);
    private readonly industryExperienceService = inject(IndustryExperienceService);
    private readonly employmentService = inject(EmploymentService);
    private readonly router = inject(Router);

    courseAdmission: ICourseAdmission | null = null;
    applicant: IApplicant | null = null;
    advancedLevelQualifications: IAdvancedLevelQualification[] = [];
    advancedLevelSubjects: IAdvancedLevelSubject[] = [];
    diplomaQualifications: IDiplomaQualification[] = [];
    industryExperiences: IIndustryExperience[] = [];
    employment: IEmployment | null = null;
    invoice: IInvoice | null = null;
    registrationNumber: string | null = null;
    isLoading = true;
    isEditing = false;

    ngOnInit(): void {
        this.loadStudentProfile();
    }

    loadStudentProfile(): void {
        this.accountService.identity().subscribe(account => {
            const email = this.normalize(account?.email);

            if (!email) {
                this.isLoading = false;
                return;
            }

            this.courseAdmissionService.query({ 'email.equals': email }).subscribe({
                next: response => {
                    this.courseAdmission = response.body?.[0] ?? null;

                    if (!this.courseAdmission) {
                        this.isLoading = false;
                        return;
                    }

                    const course$ =
                        this.courseAdmission.courseRefId && !this.courseAdmission.courseRef
                            ? this.courseService.find(this.courseAdmission.courseRefId).pipe(catchError(() => of({ body: null })))
                            : of({ body: this.courseAdmission.courseRef ?? null });

                    const invoice$ = this.courseAdmission.id
                        ? this.invoiceService.query({ 'courseAdmissionId.equals': this.courseAdmission.id }).pipe(
                            map(response => response.body ?? []),
                            catchError(() =>
                                this.invoiceService.query({ 'courseAdmission.id.equals': this.courseAdmission!.id! }).pipe(
                                    map(fallbackResponse => fallbackResponse.body ?? []),
                                    catchError(() => of([] as IInvoice[]))
                                )
                            )
                        )
                        : of([] as IInvoice[]);

                    const applicant$ = this.findApplicant(email, this.normalize(this.courseAdmission.nic));

                    forkJoin({ course: course$, invoices: invoice$, applicant: applicant$ }).subscribe({
                        next: results => {
                            if (results.course.body && this.courseAdmission) {
                                this.courseAdmission.courseRef = results.course.body;
                            }

                            const matchedInvoice =
                                results.invoices.find(invoice => this.normalize(invoice.registrationNumber)) ?? results.invoices[0] ?? null;

                            this.invoice = matchedInvoice;
                            this.registrationNumber = this.normalize(matchedInvoice?.registrationNumber);
                            this.applicant = results.applicant;

                            if (this.applicant?.id) {
                                this.loadApplicantRelatedData(this.applicant.id);
                                return;
                            }

                            this.isLoading = false;
                        },
                        error: () => {
                            this.isLoading = false;
                        },
                    });
                },
                error: () => {
                    this.isLoading = false;
                },
            });
        });
    }

    editProfile(): void {
        if (this.courseAdmission) {
            this.isEditing = true;
        }
    }

    navigateToChangePassword(): void {
        this.router.navigate(['/student-profile/change-password']);
    }

    cancelEdit(): void {
        this.isEditing = false;
    }

    onSaveSuccess(): void {
        this.isEditing = false;
        this.loadStudentProfile();
    }

    private findApplicant(email: string | null, nicNumber: string | null) {
        const byEmail$ = email
            ? this.applicantService.query({ 'email.equals': email, page: 0, size: 1 }).pipe(
                map(response => response.body ?? []),
                catchError(() => of([]))
            )
            : of([]);

        const byNic$ = nicNumber
            ? this.applicantService.query({ 'nicNumber.equals': nicNumber, page: 0, size: 1 }).pipe(
                map(response => response.body ?? []),
                catchError(() => of([]))
            )
            : of([]);

        return forkJoin({ byEmail: byEmail$, byNic: byNic$ }).pipe(
            map(({ byEmail, byNic }) => byEmail[0] ?? byNic[0] ?? null)
        );
    }

    private loadApplicantRelatedData(applicantId: number): void {
        const req = { 'applicantId.equals': applicantId };

        forkJoin({
            advancedLevelQualifications: this.advancedLevelQualificationService.query(req).pipe(catchError(() => of({ body: [] }))),
            diplomaQualifications: this.diplomaQualificationService.query(req).pipe(catchError(() => of({ body: [] }))),
            industryExperiences: this.industryExperienceService.query(req).pipe(catchError(() => of({ body: [] }))),
            employments: this.employmentService.query(req).pipe(catchError(() => of({ body: [] }))),
        }).subscribe({
            next: results => {
                this.advancedLevelQualifications = results.advancedLevelQualifications.body ?? [];
                this.diplomaQualifications = results.diplomaQualifications.body ?? [];
                this.industryExperiences = results.industryExperiences.body ?? [];
                this.employment = results.employments.body?.[0] ?? null;

                this.loadAdvancedLevelSubjects();
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    private loadAdvancedLevelSubjects(): void {
        const qualificationIds = this.advancedLevelQualifications.map(qualification => qualification.id).filter(id => id != null);

        if (qualificationIds.length === 0) {
            this.advancedLevelSubjects = [];
            this.isLoading = false;
            return;
        }

        this.advancedLevelSubjectService
            .query({ 'advancedLevelQualificationId.in': qualificationIds.join(',') })
            .pipe(catchError(() => of({ body: [] })))
            .subscribe({
                next: response => {
                    this.advancedLevelSubjects = response.body ?? [];
                    this.isLoading = false;
                },
                error: () => {
                    this.advancedLevelSubjects = [];
                    this.isLoading = false;
                },
            });
    }

    private normalize(value: string | String | null | undefined): string | null {
        const normalizedValue = value?.toString().trim();
        return normalizedValue ? normalizedValue : null;
    }
}
