import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import dayjs from 'dayjs/esm';

import { Gender } from 'app/entities/enumerations/gender.model';
import { FinanceType } from 'app/entities/enumerations/finance-type.model';
import { CourseType } from 'app/entities/enumerations/course-type.model';
import { NVQType } from 'app/entities/enumerations/nvq-type.model';
import { IApplicant } from 'app/entities/applicant/applicant.model';
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { IEmployment } from 'app/entities/employment/employment.model';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { IAdvancedLevelQualification } from 'app/entities/advanced-level-qualification/advanced-level-qualification.model';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { IAdvancedLevelSubject } from 'app/entities/advanced-level-subject/advanced-level-subject.model';
import { AdvancedLevelSubjectService } from 'app/entities/advanced-level-subject/service/advanced-level-subject.service';
import { IDiplomaQualification } from 'app/entities/diploma-qualification/diploma-qualification.model';
import { DiplomaQualificationService } from 'app/entities/diploma-qualification/service/diploma-qualification.service';
import { IIndustryExperience } from 'app/entities/industry-experience/industry-experience.model';
import { IndustryExperienceService } from 'app/entities/industry-experience/service/industry-experience.service';
import { ApplicationStatus } from 'app/enums/application-status.model';
import { ICourseAdmission } from '../course-admission/course-admission.model';
import { CourseAdmissionService } from '../course-admission/service/course-admission.service';
import { ICourse } from '../course/course.model';
import { CourseService } from '../course/service/course.service';
import { IInvoice } from '../invoice/invoice.model';
import { InvoiceService } from '../invoice/service/invoice.service';

@Component({
    selector: 'app-student-profile-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
    templateUrl: './student-profile-edit.component.html',
})
export class StudentProfileEditComponent implements OnInit, OnChanges {
    @Input() applicant: IApplicant | null = null;
    @Input() courseAdmission: ICourseAdmission | null = null;
    @Input() employment: IEmployment | null = null;
    @Input() advancedLevelQualifications: IAdvancedLevelQualification[] = [];
    @Input() advancedLevelSubjects: IAdvancedLevelSubject[] = [];
    @Input() diplomaQualifications: IDiplomaQualification[] = [];
    @Input() industryExperiences: IIndustryExperience[] = [];
    @Input() invoice: IInvoice | null = null;

    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private readonly fb = inject(FormBuilder);
    private readonly applicantService = inject(ApplicantService);
    private readonly employmentService = inject(EmploymentService);
    private readonly advancedLevelQualificationService = inject(AdvancedLevelQualificationService);
    private readonly advancedLevelSubjectService = inject(AdvancedLevelSubjectService);
    private readonly diplomaQualificationService = inject(DiplomaQualificationService);
    private readonly industryExperienceService = inject(IndustryExperienceService);
    private readonly courseAdmissionService = inject(CourseAdmissionService);
    private readonly courseService = inject(CourseService);
    private readonly invoiceService = inject(InvoiceService);

    readonly genderOptions = Object.values(Gender);
    readonly financeTypeOptions = Object.values(FinanceType);
    readonly courseTypeOptions = Object.values(CourseType);
    readonly nvqTypeOptions = Object.values(NVQType);
    readonly applicationStatusOptions = Object.values(ApplicationStatus);

    courses: ICourse[] = [];
    isSaving = false;
    errorMessage: string | null = null;

    readonly form = this.fb.group({
        applicant: this.fb.group({
            fullName: ['', Validators.required],
            initialsName: [''],
            dateOfBirth: [null as Date | null],
            gender: [''],
            nationality: [''],
            nicNumber: [''],
            email: ['', Validators.email],
            mobileNumber: [''],
            whatsappNumber: [''],
            contactAddress: [''],
            permanentAddress: [''],
            district: [''],
            preferredCourseType: [''],
            financeType: [''],
            sponsorName: [''],
        }),
        admission: this.fb.group({
            courseRefId: [null as number | null],
            registrationNumber: [''],
            teleNo: [''],
            status: [''],
            isSinglePayment: [null as boolean | null],
            appliedDateTime: [null as Date | null],
        }),
        employment: this.fb.group({
            organizationName: [''],
            designation: [''],
            officialTelephone: [''],
            officialAddress: [''],
        }),
        advancedLevelQualifications: this.fb.array<FormGroup>([]),
        diplomaQualifications: this.fb.array<FormGroup>([]),
        industryExperiences: this.fb.array<FormGroup>([]),
    });

    ngOnInit(): void {
        this.loadCourses();
        this.resetForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (Object.keys(changes).length > 0) {
            this.resetForm();
        }
    }

    get advancedLevelQualificationsArray(): FormArray<FormGroup> {
        return this.form.get('advancedLevelQualifications') as FormArray<FormGroup>;
    }

    get diplomaQualificationsArray(): FormArray<FormGroup> {
        return this.form.get('diplomaQualifications') as FormArray<FormGroup>;
    }

    get industryExperiencesArray(): FormArray<FormGroup> {
        return this.form.get('industryExperiences') as FormArray<FormGroup>;
    }

    getSubjectsArray(qualificationIndex: number): FormArray<FormGroup> {
        return this.advancedLevelQualificationsArray.at(qualificationIndex).get('subjects') as FormArray<FormGroup>;
    }

    addAdvancedLevelQualification(): void {
        this.advancedLevelQualificationsArray.push(this.createAdvancedLevelQualificationGroup());
    }

    removeAdvancedLevelQualification(index: number): void {
        this.advancedLevelQualificationsArray.removeAt(index);
    }

    addAdvancedLevelSubject(qualificationIndex: number): void {
        this.getSubjectsArray(qualificationIndex).push(this.createAdvancedLevelSubjectGroup());
    }

    removeAdvancedLevelSubject(qualificationIndex: number, subjectIndex: number): void {
        this.getSubjectsArray(qualificationIndex).removeAt(subjectIndex);
    }

    addDiplomaQualification(): void {
        this.diplomaQualificationsArray.push(this.createDiplomaQualificationGroup());
    }

    removeDiplomaQualification(index: number): void {
        this.diplomaQualificationsArray.removeAt(index);
    }

    addIndustryExperience(): void {
        this.industryExperiencesArray.push(this.createIndustryExperienceGroup());
    }

    removeIndustryExperience(index: number): void {
        this.industryExperiencesArray.removeAt(index);
    }

    onSubmit(): void {
        if (this.form.invalid || !this.courseAdmission?.id) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this.errorMessage = null;

        forkJoin([
            this.saveCourseAdmission(),
            this.saveInvoice(),
            this.saveApplicantAndEmployment(),
            this.saveAdvancedLevelSection(),
            this.saveDiplomaSection(),
            this.saveIndustrySection(),
        ]).subscribe({
            next: () => {
                this.isSaving = false;
                this.saved.emit();
            },
            error: () => {
                this.isSaving = false;
                this.errorMessage = 'Unable to save profile changes. Please try again.';
            },
        });
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    private resetForm(): void {
        this.form.patchValue({
            applicant: {
                fullName: this.asText(this.applicant?.fullName ?? this.courseAdmission?.fullName),
                initialsName: this.asText(this.applicant?.initialsName ?? this.courseAdmission?.nameWithInitials),
                dateOfBirth: this.toDateValue(this.applicant?.dateOfBirth ?? this.courseAdmission?.dateOfBirth),
                gender: this.applicant?.gender ?? '',
                nationality: this.asText(this.applicant?.nationality),
                nicNumber: this.asText(this.applicant?.nicNumber ?? this.courseAdmission?.nic),
                email: this.asText(this.applicant?.email ?? this.courseAdmission?.email),
                mobileNumber: this.asText(this.applicant?.mobileNumber ?? this.courseAdmission?.mobileNo),
                whatsappNumber: this.asText(this.applicant?.whatsappNumber ?? this.courseAdmission?.whatsAppNo),
                contactAddress: this.asText(this.applicant?.contactAddress),
                permanentAddress: this.asText(this.applicant?.permanentAddress ?? this.courseAdmission?.permanentAddress),
                district: this.asText(this.applicant?.district),
                preferredCourseType: this.applicant?.preferredCourseType ?? '',
                financeType: this.applicant?.financeType ?? '',
                sponsorName: this.asText(this.applicant?.sponsorName ?? this.courseAdmission?.sponsorByWhom),
            },
            admission: {
                courseRefId: this.courseAdmission?.courseRefId ?? this.courseAdmission?.courseRef?.id ?? null,
                registrationNumber: this.asText(this.invoice?.registrationNumber),
                teleNo: this.asText(this.courseAdmission?.teleNo),
                status: this.asText(this.courseAdmission?.status),
                isSinglePayment: this.courseAdmission?.isSinglePayment ?? null,
                appliedDateTime: this.toDateValue(this.courseAdmission?.appliedDateTime),
            },
            employment: {
                organizationName: this.asText(this.employment?.organizationName ?? this.courseAdmission?.employer),
                designation: this.asText(this.employment?.designation ?? this.courseAdmission?.employerDesignation),
                officialTelephone: this.asText(this.employment?.officialTelephone ?? this.courseAdmission?.employerTeleNo),
                officialAddress: this.asText(this.employment?.officialAddress ?? this.courseAdmission?.employerOfficialAddress),
            },
        });

        this.resetAdvancedLevelQualifications();
        this.resetDiplomas();
        this.resetIndustryExperiences();
    }

    private loadCourses(): void {
        this.courseService.query({ page: 0, size: 500 }).subscribe({
            next: response => {
                this.courses = response.body ?? [];
            },
            error: () => {
                this.courses = [];
            },
        });
    }

    private resetAdvancedLevelQualifications(): void {
        this.advancedLevelQualificationsArray.clear();
        if (this.advancedLevelQualifications.length === 0) {
            this.addAdvancedLevelQualification();
            this.addAdvancedLevelSubject(0);
            return;
        }

        this.advancedLevelQualifications.forEach(qualification => {
            const subjects = this.advancedLevelSubjects.filter(subject => subject.advancedLevelQualification?.id === qualification.id);
            this.advancedLevelQualificationsArray.push(this.createAdvancedLevelQualificationGroup(qualification, subjects));
        });
    }

    private resetDiplomas(): void {
        this.diplomaQualificationsArray.clear();
        if (this.diplomaQualifications.length === 0) {
            this.addDiplomaQualification();
            return;
        }

        this.diplomaQualifications.forEach(diploma => this.diplomaQualificationsArray.push(this.createDiplomaQualificationGroup(diploma)));
    }

    private resetIndustryExperiences(): void {
        this.industryExperiencesArray.clear();
        if (this.industryExperiences.length === 0) {
            this.addIndustryExperience();
            return;
        }

        this.industryExperiences.forEach(experience => this.industryExperiencesArray.push(this.createIndustryExperienceGroup(experience)));
    }

    private createAdvancedLevelQualificationGroup(
        qualification?: IAdvancedLevelQualification,
        subjects: IAdvancedLevelSubject[] = []
    ): FormGroup {
        return this.fb.group({
            id: [qualification?.id ?? null],
            examYear: [qualification?.examYear ?? null],
            indexNumber: [qualification?.indexNumber ?? ''],
            stream: [qualification?.stream ?? ''],
            medium: [qualification?.medium ?? ''],
            zScore: [qualification?.zScore ?? null],
            subjects: this.fb.array(
                subjects.length > 0 ? subjects.map(subject => this.createAdvancedLevelSubjectGroup(subject)) : [this.createAdvancedLevelSubjectGroup()]
            ),
        });
    }

    private createAdvancedLevelSubjectGroup(subject?: IAdvancedLevelSubject): FormGroup {
        return this.fb.group({
            id: [subject?.id ?? null],
            subjectName: [subject?.subjectName ?? ''],
            grade: [subject?.grade ?? ''],
        });
    }

    private createDiplomaQualificationGroup(diploma?: IDiplomaQualification): FormGroup {
        return this.fb.group({
            id: [diploma?.id ?? null],
            qualificationType: [diploma?.qualificationType ?? ''],
            diplomaProgramName: [diploma?.diplomaProgramName ?? ''],
            discipline: [diploma?.discipline ?? ''],
            instituteName: [diploma?.instituteName ?? ''],
            effectiveDate: [this.toDateValue(diploma?.effectiveDate)],
            certificateRefNumber: [diploma?.certificateRefNumber ?? ''],
        });
    }

    private createIndustryExperienceGroup(experience?: IIndustryExperience): FormGroup {
        return this.fb.group({
            id: [experience?.id ?? null],
            instituteName: [experience?.instituteName ?? ''],
            fromDate: [this.toDateValue(experience?.fromDate)],
            toDate: [this.toDateValue(experience?.toDate)],
            years: [experience?.years ?? null],
            months: [experience?.months ?? null],
        });
    }

    private saveCourseAdmission(): Observable<unknown> {
        if (!this.courseAdmission?.id) {
            return of(null);
        }

        const applicantValue = this.form.get('applicant')?.getRawValue();
        const admissionValue = this.form.get('admission')?.getRawValue();
        const employmentValue = this.form.get('employment')?.getRawValue();
        const selectedCourseId = this.toNumberOrNull(admissionValue?.courseRefId);
        const selectedCourse = this.courses.find(course => course.id === selectedCourseId) ?? this.courseAdmission.courseRef ?? null;

        const payload: ICourseAdmission = {
            ...this.courseAdmission,
            id: this.courseAdmission.id,
            fullName: this.normalize(applicantValue?.fullName),
            nameWithInitials: this.normalize(applicantValue?.initialsName),
            permanentAddress: this.normalize(applicantValue?.permanentAddress),
            teleNo: this.normalize(admissionValue?.teleNo),
            mobileNo: this.normalize(applicantValue?.mobileNumber),
            whatsAppNo: this.normalize(applicantValue?.whatsappNumber),
            email: this.normalize(applicantValue?.email),
            nic: this.normalize(applicantValue?.nicNumber),
            dateOfBirth: this.toDayjsOrNull(applicantValue?.dateOfBirth),
            employer: this.normalize(employmentValue?.organizationName),
            employerDesignation: this.normalize(employmentValue?.designation),
            employerOfficialAddress: this.normalize(employmentValue?.officialAddress),
            employerTeleNo: this.normalize(employmentValue?.officialTelephone),
            employerFaxNo: this.courseAdmission.employerFaxNo ?? null,
            sponsorByWhom: this.normalize(applicantValue?.sponsorName),
            advertisementTypeOther: this.courseAdmission.advertisementTypeOther ?? null,
            status: this.normalize(admissionValue?.status),
            appliedDateTime: this.toDayjsOrNull(admissionValue?.appliedDateTime),
            approval1Status: this.courseAdmission.approval1Status ?? null,
            approval1DateTime: this.courseAdmission.approval1DateTime ?? null,
            approval2Status: this.courseAdmission.approval2Status ?? null,
            approval2DateTime: this.courseAdmission.approval2DateTime ?? null,
            approval3Status: this.courseAdmission.approval3Status ?? null,
            approval3DateTime: this.courseAdmission.approval3DateTime ?? null,
            courseRefId: selectedCourseId,
            courseRef: selectedCourse,
            isSinglePayment: admissionValue?.isSinglePayment ?? null,
        };

        return this.courseAdmissionService.update(payload);
    }

    private saveInvoice(): Observable<unknown> {
        if (!this.invoice?.id) {
            return of(null);
        }

        return this.invoiceService.update({
            ...this.invoice,
            id: this.invoice.id,
            registrationNumber: this.normalize(this.form.get('admission.registrationNumber')?.value),
        } as IInvoice);
    }

    private saveApplicantAndEmployment(): Observable<unknown> {
        if (!this.applicant?.id) {
            return of(null);
        }

        const applicantValue = this.form.get('applicant')?.getRawValue();
        const employmentValue = this.form.get('employment')?.getRawValue();
        const applicantPayload: IApplicant = {
            ...this.applicant,
            id: this.applicant.id,
            fullName: this.normalize(applicantValue?.fullName),
            initialsName: this.normalize(applicantValue?.initialsName),
            dateOfBirth: this.toDayjsOrNull(applicantValue?.dateOfBirth),
            gender: this.normalize(applicantValue?.gender),
            nationality: this.normalize(applicantValue?.nationality),
            nicNumber: this.normalize(applicantValue?.nicNumber),
            email: this.normalize(applicantValue?.email),
            mobileNumber: this.normalize(applicantValue?.mobileNumber),
            whatsappNumber: this.normalize(applicantValue?.whatsappNumber),
            contactAddress: this.normalize(applicantValue?.contactAddress),
            permanentAddress: this.normalize(applicantValue?.permanentAddress),
            district: this.normalize(applicantValue?.district),
            preferredCourseType: this.normalize(applicantValue?.preferredCourseType),
            financeType: this.normalize(applicantValue?.financeType),
            sponsorName: this.normalize(applicantValue?.sponsorName),
            declarationAccepted: this.applicant.declarationAccepted ?? true,
            employment: this.applicant.employment ?? null,
        };

        const hasEmploymentData = this.hasAnyValue([
            employmentValue?.organizationName,
            employmentValue?.designation,
            employmentValue?.officialTelephone,
            employmentValue?.officialAddress,
        ]);

        if (this.employment?.id && !hasEmploymentData) {
            return this.employmentService.delete(this.employment.id).pipe(
                switchMap(() => this.applicantService.update({ ...applicantPayload, employment: null }))
            );
        }

        if (this.employment?.id) {
            return this.employmentService
                .update({
                    ...this.employment,
                    id: this.employment.id,
                    organizationName: this.normalize(employmentValue?.organizationName),
                    designation: this.normalize(employmentValue?.designation),
                    officialTelephone: this.normalize(employmentValue?.officialTelephone),
                    officialAddress: this.normalize(employmentValue?.officialAddress),
                    applicant: { id: this.applicant.id },
                })
                .pipe(switchMap(response => this.applicantService.update({ ...applicantPayload, employment: response.body ? { id: response.body.id } : null })));
        }

        if (!hasEmploymentData) {
            return this.applicantService.update({ ...applicantPayload, employment: null });
        }

        return this.employmentService
            .create({
                id: null,
                organizationName: this.normalize(employmentValue?.organizationName),
                designation: this.normalize(employmentValue?.designation),
                officialTelephone: this.normalize(employmentValue?.officialTelephone),
                officialAddress: this.normalize(employmentValue?.officialAddress),
                applicant: { id: this.applicant.id },
            })
            .pipe(switchMap(response => this.applicantService.update({ ...applicantPayload, employment: response.body ? { id: response.body.id } : null })));
    }

    private saveAdvancedLevelSection(): Observable<unknown> {
        if (!this.applicant?.id) {
            return of(null);
        }

        const submittedQualifications = this.advancedLevelQualificationsArray.getRawValue() as Array<{
            id: number | null;
            examYear: number | null;
            indexNumber: string;
            stream: string;
            medium: string;
            zScore: number | null;
            subjects: Array<{ id: number | null; subjectName: string; grade: string }>;
        }>;

        const existingQualificationIds = this.advancedLevelQualifications.map(qualification => qualification.id);
        const retainedQualificationIds = submittedQualifications
            .map(qualification => qualification.id)
            .filter((id): id is number => id !== null && id !== undefined);
        const qualificationIdsToDelete = existingQualificationIds.filter(id => !retainedQualificationIds.includes(id));
        const subjectIdsToDelete = this.advancedLevelSubjects
            .filter(subject => qualificationIdsToDelete.includes(subject.advancedLevelQualification?.id ?? -1))
            .map(subject => subject.id);

        const requests: Observable<unknown>[] = [
            ...submittedQualifications
                .filter(qualification => this.shouldPersistAdvancedLevelQualification(qualification))
                .map(qualification => this.upsertAdvancedLevelQualification(qualification)),
            ...subjectIdsToDelete.map(id => this.advancedLevelSubjectService.delete(id)),
            ...qualificationIdsToDelete.map(id => this.advancedLevelQualificationService.delete(id)),
        ];

        return this.combineRequests(requests);
    }

    private upsertAdvancedLevelQualification(qualification: {
        id: number | null;
        examYear: number | null;
        indexNumber: string;
        stream: string;
        medium: string;
        zScore: number | null;
        subjects: Array<{ id: number | null; subjectName: string; grade: string }>;
    }): Observable<unknown> {
        if (!this.applicant?.id) {
            return of(null);
        }

        const payload = {
            examYear: this.toNumberOrNull(qualification.examYear),
            indexNumber: this.normalize(qualification.indexNumber),
            stream: this.normalize(qualification.stream),
            medium: this.normalize(qualification.medium),
            zScore: this.toNumberOrNull(qualification.zScore),
            applicant: { id: this.applicant.id },
        };

        if (qualification.id) {
            return this.advancedLevelQualificationService
                .update({ id: qualification.id, ...payload })
                .pipe(switchMap(() => this.syncAdvancedLevelSubjects(qualification.id!, qualification.subjects)));
        }

        return this.advancedLevelQualificationService
            .create({ id: null, ...payload })
            .pipe(switchMap(response => this.syncAdvancedLevelSubjects(response.body!.id, qualification.subjects)));
    }

    private syncAdvancedLevelSubjects(
        qualificationId: number,
        submittedSubjects: Array<{ id: number | null; subjectName: string; grade: string }>
    ): Observable<unknown> {
        const existingSubjects = this.advancedLevelSubjects.filter(subject => subject.advancedLevelQualification?.id === qualificationId);
        const existingIds = existingSubjects.map(subject => subject.id);
        const retainedIds = submittedSubjects.map(subject => subject.id).filter((id): id is number => id !== null && id !== undefined);
        const idsToDelete = existingIds.filter(id => !retainedIds.includes(id));

        const requests: Observable<unknown>[] = [
            ...submittedSubjects
                .filter(subject => this.shouldPersistAdvancedLevelSubject(subject))
                .map(subject => {
                    const payload = {
                        subjectName: this.normalize(subject.subjectName),
                        grade: this.normalize(subject.grade),
                        advancedLevelQualification: { id: qualificationId },
                    };

                    return subject.id
                        ? this.advancedLevelSubjectService.update({ id: subject.id, ...payload })
                        : this.advancedLevelSubjectService.create({ id: null, ...payload });
                }),
            ...idsToDelete.map(id => this.advancedLevelSubjectService.delete(id)),
        ];

        return this.combineRequests(requests);
    }

    private saveDiplomaSection(): Observable<unknown> {
        if (!this.applicant?.id) {
            return of(null);
        }

        const submittedDiplomas = this.diplomaQualificationsArray.getRawValue() as Array<{
            id: number | null;
            qualificationType: string;
            diplomaProgramName: string;
            discipline: string;
            instituteName: string;
            effectiveDate: Date | null;
            certificateRefNumber: string;
        }>;

        const existingIds = this.diplomaQualifications.map(diploma => diploma.id);
        const retainedIds = submittedDiplomas.map(diploma => diploma.id).filter((id): id is number => id !== null && id !== undefined);
        const idsToDelete = existingIds.filter(id => !retainedIds.includes(id));

        const requests: Observable<unknown>[] = [
            ...submittedDiplomas
                .filter(diploma => this.shouldPersistDiploma(diploma))
                .map(diploma => {
                    const payload = {
                        qualificationType: this.normalize(diploma.qualificationType),
                        diplomaProgramName: this.normalize(diploma.diplomaProgramName),
                        discipline: this.normalize(diploma.discipline),
                        instituteName: this.normalize(diploma.instituteName),
                        effectiveDate: this.toDayjsOrNull(diploma.effectiveDate),
                        certificateRefNumber: this.normalize(diploma.certificateRefNumber),
                        applicant: { id: this.applicant!.id },
                    };

                    return diploma.id
                        ? this.diplomaQualificationService.update({ id: diploma.id, ...payload })
                        : this.diplomaQualificationService.create({ id: null, ...payload });
                }),
            ...idsToDelete.map(id => this.diplomaQualificationService.delete(id)),
        ];

        return this.combineRequests(requests);
    }

    private saveIndustrySection(): Observable<unknown> {
        if (!this.applicant?.id) {
            return of(null);
        }

        const submittedExperiences = this.industryExperiencesArray.getRawValue() as Array<{
            id: number | null;
            instituteName: string;
            fromDate: Date | null;
            toDate: Date | null;
            years: number | null;
            months: number | null;
        }>;

        const existingIds = this.industryExperiences.map(experience => experience.id);
        const retainedIds = submittedExperiences.map(experience => experience.id).filter((id): id is number => id !== null && id !== undefined);
        const idsToDelete = existingIds.filter(id => !retainedIds.includes(id));

        const requests: Observable<unknown>[] = [
            ...submittedExperiences
                .filter(experience => this.shouldPersistIndustryExperience(experience))
                .map(experience => {
                    const payload = {
                        instituteName: this.normalize(experience.instituteName),
                        fromDate: this.toDayjsOrNull(experience.fromDate),
                        toDate: this.toDayjsOrNull(experience.toDate),
                        years: this.toNumberOrNull(experience.years),
                        months: this.toNumberOrNull(experience.months),
                        applicant: { id: this.applicant!.id },
                    };

                    return experience.id
                        ? this.industryExperienceService.update({ id: experience.id, ...payload })
                        : this.industryExperienceService.create({ id: null, ...payload });
                }),
            ...idsToDelete.map(id => this.industryExperienceService.delete(id)),
        ];

        return this.combineRequests(requests);
    }

    private combineRequests(requests: Observable<unknown>[]): Observable<unknown> {
        return requests.length > 0 ? forkJoin(requests) : of(null);
    }

    private shouldPersistAdvancedLevelQualification(qualification: {
        examYear: number | null;
        indexNumber: string;
        stream: string;
        medium: string;
        zScore: number | null;
        subjects: Array<{ subjectName: string; grade: string }>;
    }): boolean {
        return (
            this.hasAnyValue([qualification.examYear, qualification.indexNumber, qualification.stream, qualification.medium, qualification.zScore]) ||
            qualification.subjects.some(subject => this.shouldPersistAdvancedLevelSubject(subject))
        );
    }

    private shouldPersistAdvancedLevelSubject(subject: { subjectName: string; grade: string }): boolean {
        return this.hasAnyValue([subject.subjectName, subject.grade]);
    }

    private shouldPersistDiploma(diploma: {
        qualificationType: string;
        diplomaProgramName: string;
        discipline: string;
        instituteName: string;
        effectiveDate: Date | null;
        certificateRefNumber: string;
    }): boolean {
        return this.hasAnyValue([
            diploma.qualificationType,
            diploma.diplomaProgramName,
            diploma.discipline,
            diploma.instituteName,
            diploma.effectiveDate,
            diploma.certificateRefNumber,
        ]);
    }

    private shouldPersistIndustryExperience(experience: {
        instituteName: string;
        fromDate: Date | null;
        toDate: Date | null;
        years: number | null;
        months: number | null;
    }): boolean {
        return this.hasAnyValue([experience.instituteName, experience.fromDate, experience.toDate, experience.years, experience.months]);
    }

    private normalize(value: unknown): any {
        if (value === null || value === undefined) {
            return null;
        }

        const trimmed = String(value).trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private asText(value: unknown): string {
        return value === null || value === undefined ? '' : String(value);
    }

    private toDayjsOrNull(value: unknown): dayjs.Dayjs | null {
        if (!value) {
            return null;
        }

        const parsed = dayjs(value as dayjs.ConfigType);
        return parsed.isValid() ? parsed : null;
    }

    private toDateValue(value: unknown): Date | null {
        if (!value) {
            return null;
        }

        const parsed = dayjs(value as dayjs.ConfigType);
        return parsed.isValid() ? parsed.toDate() : null;
    }

    private toNumberOrNull(value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    }

    private hasAnyValue(values: unknown[]): boolean {
        return values.some(value => value !== null && value !== undefined && value !== '');
    }
}
