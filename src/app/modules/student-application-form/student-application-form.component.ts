import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

// Services
import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { AdvancedLevelSubjectService } from 'app/entities/advanced-level-subject/service/advanced-level-subject.service';
import { DiplomaQualificationService } from 'app/entities/diploma-qualification/service/diploma-qualification.service';
import { IndustryExperienceService } from 'app/entities/industry-experience/service/industry-experience.service';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { AchievementService } from 'app/entities/achievement/service/achievement.service';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { DocumentService } from 'app/entities/document/service/document.service';
import { InvoiceService } from '../invoice/service/invoice.service';
import { NewPayment } from 'app/entities/payment/payment.model';
import { NVQType } from 'app/entities/enumerations/nvq-type.model';

@Component({
    standalone: true,
    selector: 'app-student-application-form',
    templateUrl: './student-application-form.component.html',
    styleUrls: ['./student-application-form.component.scss'],
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
        MatDividerModule,
        MatExpansionModule,
        RouterModule,
    ],
})
export class StudentApplicationFormComponent implements OnInit {
    form!: FormGroup;
    genders = ['MALE', 'FEMALE'];
    courseTypes = ['WEEKDAY', 'WEEKEND'];
    financeTypes = ['SELF', 'SPONSORED'];
    paymentMethods = ['CASH', 'BANK_TRANSFER', 'ONLINE'];
    qualificationTypes = Object.values(NVQType);
    selectedSlipFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private applicantService: ApplicantService,
        private alService: AdvancedLevelQualificationService,
        private alSubjectService: AdvancedLevelSubjectService,
        private diplomaService: DiplomaQualificationService,
        private industryService: IndustryExperienceService,
        private employmentService: EmploymentService,
        private achievementService: AchievementService,
        private paymentService: PaymentService,
        private documentService: DocumentService,
        private invoiceService: InvoiceService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            applicant: this.fb.group({
                fullName: ['', Validators.required],
                initialsName: [''],
                contactAddress: [''],
                permanentAddress: [''],
                district: [''],
                email: [''],
                dateOfBirth: [''],
                gender: [''],
                nationality: [''],
                nicNumber: [''],
                mobileNumber: [''],
                whatsappNumber: [''],
                preferredCourseType: [''],
                financeType: [''],
                sponsorName: [''],
                declarationAccepted: [false, Validators.requiredTrue],
            }),
            advancedLevel: this.fb.group({
                examYear: [''],
                indexNumber: [''],
                stream: [''],
                medium: [''],
                zScore: [''],
                subjects: this.fb.array([this.createSubject(), this.createSubject(), this.createSubject()]),
            }),
            diplomas: this.fb.array([]),
            industry: this.fb.array([]),
            employment: this.fb.group({
                organizationName: [''],
                designation: [''],
                officialTelephone: [''],
                officialAddress: [''],
            }),
            achievements: [''],
            payment: this.fb.group({
                paymentMethod: ['', Validators.required],
                amount: ['', Validators.required],
                referenceNumber: [''],
                invoiceNo: [''],
                paymentDate: [new Date()],
                paymentStatus: ['PENDING'],
                slip: [null],
            }),
        });
    }

    createSubject(): FormGroup {
        return this.fb.group({
            subjectName: [''],
            grade: [''],
        });
    }

    get subjects(): FormArray {
        return this.form.get('advancedLevel.subjects') as FormArray;
    }
    get diplomas(): FormArray {
        return this.form.get('diplomas') as FormArray;
    }
    get industry(): FormArray {
        return this.form.get('industry') as FormArray;
    }

    addDiploma(): void {
        this.diplomas.push(
            this.fb.group({
                qualificationType: [''],
                diplomaProgramName: [''],
                discipline: [''],
                instituteName: [''],
                effectiveDate: [''],
                certificateRefNumber: [''],
            })
        );
    }

    addIndustry(): void {
        this.industry.push(
            this.fb.group({
                instituteName: [''],
                fromDate: [''],
                toDate: [''],
                years: [''],
                months: [''],
            })
        );
    }

    removeDiploma(index: number): void {
        this.diplomas.removeAt(index);
    }
    removeIndustry(index: number): void {
        this.industry.removeAt(index);
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const data = this.form.getRawValue();

        const cleanAdvancedLevel = {
            examYear: this.toNumberOrNull(data.advancedLevel?.examYear),
            indexNumber: this.normalizeText(data.advancedLevel?.indexNumber),
            stream: this.normalizeText(data.advancedLevel?.stream),
            medium: this.normalizeText(data.advancedLevel?.medium),
            zScore: this.toNumberOrNull(data.advancedLevel?.zScore),
            subjects: data.advancedLevel?.subjects || [],
        };

        const applicantData: any = {
            fullName: this.normalizeText(data.applicant.fullName),
            initialsName: this.normalizeText(data.applicant.initialsName),
            contactAddress: this.normalizeText(data.applicant.contactAddress),
            permanentAddress: this.normalizeText(data.applicant.permanentAddress),
            district: this.normalizeText(data.applicant.district),
            email: this.normalizeText(data.applicant.email),
            dateOfBirth: data.applicant.dateOfBirth ? dayjs(data.applicant.dateOfBirth).format(DATE_FORMAT) : null,
            gender: this.normalizeText(data.applicant.gender),
            nationality: this.normalizeText(data.applicant.nationality),
            nicNumber: this.normalizeText(data.applicant.nicNumber),
            mobileNumber: this.normalizeText(data.applicant.mobileNumber),
            whatsappNumber: this.normalizeText(data.applicant.whatsappNumber),
            preferredCourseType: this.normalizeText(data.applicant.preferredCourseType),
            financeType: this.normalizeText(data.applicant.financeType),
            sponsorName: this.normalizeText(data.applicant.sponsorName),
            declarationAccepted: data.applicant.declarationAccepted ?? null,
        };

        const nicNumber = applicantData.nicNumber;

        if (nicNumber) {
            this.form.get('applicant.nicNumber')?.setErrors(null);
        }

        const createApplicant = (): void => {
            this.applicantService.create(applicantData).subscribe({
                next: applicantRes => {
            const applicant = applicantRes.body!;
            const applicantRef = { id: applicant.id };
            const calls: any[] = [];

            // A/L Qualification + Subjects
            const hasAdvancedLevelData =
                this.hasAnyValue([
                    cleanAdvancedLevel.examYear,
                    cleanAdvancedLevel.indexNumber,
                    cleanAdvancedLevel.stream,
                    cleanAdvancedLevel.medium,
                    cleanAdvancedLevel.zScore,
                ]) || cleanAdvancedLevel.subjects.some(s => this.normalizeText(s.subjectName));

            if (hasAdvancedLevelData) {
                const alObservable = this.alService.create({
                    examYear: cleanAdvancedLevel.examYear,
                    indexNumber: cleanAdvancedLevel.indexNumber,
                    stream: cleanAdvancedLevel.stream,
                    medium: cleanAdvancedLevel.medium,
                    zScore: cleanAdvancedLevel.zScore,
                    applicant: applicantRef,
                    id: null,
                });

                calls.push(
                    alObservable.pipe(
                        mergeMap(alRes => {
                            const alQual = alRes.body!;
                            const alSubjectsObs = cleanAdvancedLevel.subjects
                                .filter(s => this.normalizeText(s.subjectName))
                                .map(s =>
                                    this.alSubjectService.create({
                                        subjectName: this.normalizeText(s.subjectName),
                                        grade: this.normalizeText(s.grade),
                                        advancedLevelQualification: { id: alQual.id },
                                        id: null,
                                    })
                                );
                            return alSubjectsObs.length > 0 ? forkJoin(alSubjectsObs) : of(alQual);
                        })
                    )
                );
            }

            // Diplomas
            this.diplomas.value.forEach(d => {
                const diplomaPayload = {
                    qualificationType: this.isValidQualificationType(d.qualificationType) ? d.qualificationType : null,
                    diplomaProgramName: this.normalizeText(d.diplomaProgramName),
                    discipline: this.normalizeText(d.discipline),
                    instituteName: this.normalizeText(d.instituteName),
                    effectiveDate: this.toDayjsOrNull(d.effectiveDate),
                    certificateRefNumber: this.normalizeText(d.certificateRefNumber),
                    applicant: applicantRef,
                    id: null,
                };

                if (
                    !this.hasAnyValue([
                        diplomaPayload.qualificationType,
                        diplomaPayload.diplomaProgramName,
                        diplomaPayload.discipline,
                        diplomaPayload.instituteName,
                        diplomaPayload.effectiveDate,
                        diplomaPayload.certificateRefNumber,
                    ])
                ) {
                    return;
                }

                calls.push(
                    this.diplomaService.create(diplomaPayload)
                );
            });

            // Industry
            this.industry.value.forEach(i => {
                const industryPayload = {
                    instituteName: this.normalizeText(i.instituteName),
                    fromDate: this.toDayjsOrNull(i.fromDate),
                    toDate: this.toDayjsOrNull(i.toDate),
                    years: this.toNumberOrNull(i.years),
                    months: this.toNumberOrNull(i.months),
                    applicant: applicantRef,
                    id: null,
                };

                if (
                    !this.hasAnyValue([
                        industryPayload.instituteName,
                        industryPayload.fromDate,
                        industryPayload.toDate,
                        industryPayload.years,
                        industryPayload.months,
                    ])
                ) {
                    return;
                }

                calls.push(
                    this.industryService.create(industryPayload)
                );
            });

            // Achievements
            const achievementDescription = this.normalizeText(data.achievements);
            if (achievementDescription) {
                calls.push(
                    this.achievementService.create({
                        description: achievementDescription,
                        applicant: applicantRef,
                        id: null,
                    })
                );
            }

            // Employment
            let employmentObs: any = of(null);
            if (this.hasAnyValue(Object.values(data.employment))) {
                employmentObs = this.employmentService.create({
                    organizationName: this.normalizeText(data.employment.organizationName),
                    designation: this.normalizeText(data.employment.designation),
                    officialTelephone: this.normalizeText(data.employment.officialTelephone),
                    officialAddress: this.normalizeText(data.employment.officialAddress),
                    applicant: applicantRef,
                    id: null,
                }).pipe(
                    mergeMap(emp => this.applicantService.update({ ...applicant, employment: { id: emp.body!.id } }))
                );
            }

            forkJoin([...calls, employmentObs].filter(Boolean)).subscribe(() => {
                const paymentData = data.payment;

                this.invoiceService.getInvoiceIdByInvoiceNo(paymentData.invoiceNo).pipe(
                    mergeMap(invoiceId => {
                        alert('Invoice ID: ' + invoiceId);
                        if (!invoiceId || invoiceId <= 0) {
                            throw new Error('Invoice not found');
                        }

                        const paymentPayload: NewPayment = {
                            invoiceId: Number(invoiceId),
                            paymentMethod: paymentData.paymentMethod,
                            amount: Number(paymentData.amount),
                            referenceNumber: this.normalizeText(paymentData.referenceNumber),
                            paymentDate: paymentData.paymentDate ? dayjs(paymentData.paymentDate) : dayjs(),
                            paymentStatus: 'PENDING',
                            applicant: { id: applicant.id },
                            id: null,
                        };

                        return this.paymentService.create(paymentPayload).pipe(
                            mergeMap(paymentRes => {
                                alert('Payment ID: ' + paymentRes.body?.id);
                                const payment = paymentRes.body!;
                                if (paymentData.paymentMethod === 'BANK_TRANSFER' && this.selectedSlipFile) {
                                    const formData = new FormData();
                                    formData.append('file', this.selectedSlipFile!);
                                    formData.append('paymentId', String(payment.id));

                                    return this.documentService.upload(formData);
                                }
                                return of(payment);
                            })
                        );
                    })
                ).subscribe({
                    next: () => {
                        alert('Payment and application submitted successfully!');
                        this.form.reset();
                    },
                    error: err => {
                        console.error(err);
                        alert('Error submitting payment: ' + err.message);
                    },
                });

            }, err => {
                console.error('Error submitting application details:', err);
                alert('Error submitting application details. Please check the entered data and try again.');
            });
                },
                error: err => {
                    this.handleApplicantCreateError(err);
                },
            });
        };

        if (!nicNumber) {
            createApplicant();
            return;
        }

        this.applicantService.query({ 'nicNumber.equals': nicNumber, page: 0, size: 1 }).subscribe({
            next: response => {
                if ((response.body?.length ?? 0) > 0) {
                    this.setDuplicateNicError();
                    return;
                }

                createApplicant();
            },
            error: err => {
                console.error('Error validating NIC number:', err);
                alert('Unable to validate the NIC number right now. Please try again.');
            },
        });
    }


    onSlipSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedSlipFile = input.files[0];
            this.form.get('payment.slip')?.setValue(this.selectedSlipFile);
        }
    }

    printForm(): void {
        window.print();
    }

    private normalizeText(value: unknown): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const trimmedValue = String(value).trim();
        return trimmedValue.length > 0 ? trimmedValue : null;
    }

    private toNumberOrNull(value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
    }

    private toDayjsOrNull(value: unknown): dayjs.Dayjs | null {
        if (!value) {
            return null;
        }

        if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date || dayjs.isDayjs(value))) {
            return null;
        }

        const parsedDate = dayjs(value);
        return parsedDate.isValid() ? parsedDate : null;
    }

    private hasAnyValue(values: unknown[]): boolean {
        return values.some(value => value !== null && value !== undefined && value !== '');
    }

    private isValidQualificationType(value: unknown): value is NVQType {
        return typeof value === 'string' && this.qualificationTypes.includes(value as NVQType);
    }

    private handleApplicantCreateError(error: unknown): void {
        console.error('Error creating applicant:', error);

        if (error instanceof HttpErrorResponse) {
            const detail = String(error.error?.detail ?? '');
            if (detail.includes('nic_number') || detail.includes('nicNumber')) {
                this.setDuplicateNicError();
                return;
            }

            if (detail) {
                alert(detail);
                return;
            }
        }

        alert('Error creating applicant. Please check the entered details and try again.');
    }

    private setDuplicateNicError(): void {
        this.form.get('applicant.nicNumber')?.setErrors({ duplicate: true });
        this.form.get('applicant.nicNumber')?.markAsTouched();
        alert('An applicant with this NIC number already exists.');
    }
}
