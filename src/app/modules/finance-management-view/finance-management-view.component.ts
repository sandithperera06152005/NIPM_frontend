// Angular Material & Fuse
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Application Imports
import { IApplicant } from '../../entities/applicant/applicant.model';
import { ApplicantService } from '../../entities/applicant/service/applicant.service';
import { IAdvancedLevelQualification } from '../../entities/advanced-level-qualification/advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from '../../entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { IAdvancedLevelSubject } from '../../entities/advanced-level-subject/advanced-level-subject.model';
import { AdvancedLevelSubjectService } from '../../entities/advanced-level-subject/service/advanced-level-subject.service';
import { IDiplomaQualification } from '../../entities/diploma-qualification/diploma-qualification.model';
import { DiplomaQualificationService } from '../../entities/diploma-qualification/service/diploma-qualification.service';
import { IIndustryExperience } from '../../entities/industry-experience/industry-experience.model';
import { IndustryExperienceService } from '../../entities/industry-experience/service/industry-experience.service';
import { IEmployment } from '../../entities/employment/employment.model';
import { EmploymentService } from '../../entities/employment/service/employment.service';
import { IAchievement } from '../../entities/achievement/achievement.model';
import { AchievementService } from '../../entities/achievement/service/achievement.service';
import { IPayment } from '../../entities/payment/payment.model';
import { PaymentService } from '../../entities/payment/service/payment.service';
import { IDocument } from '../../entities/document/document.model';
import { DocumentService } from '../../entities/document/service/document.service';

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-finance-management-view',
    standalone: true,
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
        MatListModule,
        MatChipsModule,
        MatDividerModule,
    ],
    templateUrl: './finance-management-view.component.html',
})
export class FinanceManagementViewComponent implements OnInit {
    // --- Injected Services ---
    private readonly applicantService = inject(ApplicantService);
    private readonly advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
    private readonly advancedLevelSubjectService = inject(AdvancedLevelSubjectService);
    private readonly diplomaQualificationService = inject(DiplomaQualificationService);
    private readonly industryExperienceService = inject(IndustryExperienceService);
    private readonly employmentService = inject(EmploymentService);
    private readonly achievementService = inject(AchievementService);
    private readonly paymentService = inject(PaymentService);
    private readonly documentService = inject(DocumentService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    // --- State ---
    isLoading = true;
    applicant: IApplicant | null = null;
    advancedLevelQualifications: IAdvancedLevelQualification[] = [];
    advancedLevelSubjects: IAdvancedLevelSubject[] = [];
    diplomaQualifications: IDiplomaQualification[] = [];
    industryExperiences: IIndustryExperience[] = [];
    employments: IEmployment[] = [];
    achievements: IAchievement[] = [];
    payments: IPayment[] = [];
    documents: IDocument[] = [];

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadApplicantData(Number(id));
        } else {
            this.router.navigate(['/finance-management']);
        }
    }

    loadApplicantData(id: number): void {
        this.isLoading = true;

        // Load applicant basic info
        this.applicantService.find(id)
            .pipe(
                tap(response => {
                    if (response.body) {
                        this.applicant = response.body;
                    }
                }),
                catchError(() => {
                    this.router.navigate(['/finance-management']);
                    return of(null);
                })
            )
            .subscribe(() => {
                // Load all related data in parallel
                this.loadRelatedData(id);
            });
    }

    loadRelatedData(applicantId: number): void {
        const req = { 'applicantId.equals': applicantId };

        forkJoin({
            advancedLevelQualifications: this.advancedLevelQualificationService.query(req).pipe(catchError(() => of({ body: [] }))),
            diplomaQualifications: this.diplomaQualificationService.query(req).pipe(catchError(() => of({ body: [] }))),
            industryExperiences: this.industryExperienceService.query(req).pipe(catchError(() => of({ body: [] }))),
            employments: this.employmentService.query(req).pipe(catchError(() => of({ body: [] }))),
            achievements: this.achievementService.query(req).pipe(catchError(() => of({ body: [] }))),
            payments: this.paymentService.query(req).pipe(catchError(() => of({ body: [] }))),
            documents: this.documentService.query(req).pipe(catchError(() => of({ body: [] }))),
        }).subscribe({
            next: (results) => {
                this.advancedLevelQualifications = results.advancedLevelQualifications.body ?? [];
                this.diplomaQualifications = results.diplomaQualifications.body ?? [];
                this.industryExperiences = results.industryExperiences.body ?? [];
                this.employments = results.employments.body ?? [];
                this.achievements = results.achievements.body ?? [];
                this.payments = results.payments.body ?? [];
                this.documents = results.documents.body ?? [];

                // Load A/L subjects based on the loaded A/L qualifications
                this.loadAdvancedLevelSubjects();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    loadAdvancedLevelSubjects(): void {
        // Get the IDs of all A/L qualifications for this applicant
        const alQualificationIds = this.advancedLevelQualifications.map(alq => alq.id).filter(id => id != null);

        if (alQualificationIds.length === 0) {
            this.advancedLevelSubjects = [];
            return;
        }

        // Query A/L subjects that belong to these A/L qualifications
        // Since subjects are linked to qualifications (not directly to applicants),
        // we need to filter by the qualification IDs
        const req = { 'advancedLevelQualificationId.in': alQualificationIds.join(',') };

        this.advancedLevelSubjectService.query(req).pipe(
            catchError(() => of({ body: [] }))
        ).subscribe({
            next: (results) => {
                this.advancedLevelSubjects = results.body ?? [];
            },
            error: () => {
                this.advancedLevelSubjects = [];
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/finance-management']);
    }

    getFinanceTypeColor(financeType: string | null | undefined): string {
        if (!financeType) return 'primary';
        switch (financeType) {
            case 'SELF_FUNDED': return 'accent';
            case 'SPONSORED': return 'warn';
            case 'LOAN': return 'primary';
            case 'SCHOLARSHIP': return 'accent';
            default: return 'primary';
        }
    }
    approveStudent(): void {
    }
    rejectStudent(): void {
    }
}
