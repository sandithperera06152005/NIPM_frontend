import { Component, OnInit } from '@angular/core';
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

        const data = this.form.value;

        const cleanAdvancedLevel = {
            examYear: data.advancedLevel?.examYear ? Number(data.advancedLevel.examYear) : null,
            indexNumber: data.advancedLevel?.indexNumber || null,
            stream: data.advancedLevel?.stream || null,
            medium: data.advancedLevel?.medium || null,
            zScore: data.advancedLevel?.zScore ? Number(data.advancedLevel.zScore) : null,
            subjects: data.advancedLevel?.subjects || [],
        };

        const applicantData: any = {
            fullName: data.applicant.fullName || null,
            initialsName: data.applicant.initialsName || null,
            contactAddress: data.applicant.contactAddress || null,
            permanentAddress: data.applicant.permanentAddress || null,
            district: data.applicant.district || null,
            email: data.applicant.email || null,
            dateOfBirth: data.applicant.dateOfBirth ? dayjs(data.applicant.dateOfBirth).format(DATE_FORMAT) : null,
            gender: data.applicant.gender || null,
            nationality: data.applicant.nationality || null,
            nicNumber: data.applicant.nicNumber || null,
            mobileNumber: data.applicant.mobileNumber || null,
            whatsappNumber: data.applicant.whatsappNumber || null,
            preferredCourseType: data.applicant.preferredCourseType || null,
            financeType: data.applicant.financeType || null,
            sponsorName: data.applicant.sponsorName || null,
            declarationAccepted: data.applicant.declarationAccepted ?? null,
        };

        this.applicantService.create(applicantData).subscribe(applicantRes => {
            const applicant = applicantRes.body!;
            const applicantRef = { id: applicant.id };
            const calls: any[] = [];

            // A/L Qualification + Subjects
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
                            .filter(s => s.subjectName)
                            .map(s =>
                                this.alSubjectService.create({
                                    subjectName: s.subjectName,
                                    grade: s.grade,
                                    advancedLevelQualification: { id: alQual.id },
                                    id: null,
                                })
                            );
                        return alSubjectsObs.length > 0 ? forkJoin(alSubjectsObs) : of(alQual);
                    })
                )
            );

            // Diplomas
            this.diplomas.value.forEach(d => {
                calls.push(
                    this.diplomaService.create({
                        qualificationType: d.qualificationType || null,
                        diplomaProgramName: d.diplomaProgramName || null,
                        discipline: d.discipline || null,
                        instituteName: d.instituteName || null,
                        effectiveDate: d.effectiveDate ? dayjs(d.effectiveDate) : null,
                        certificateRefNumber: d.certificateRefNumber || null,
                        applicant: applicantRef,
                        id: null,
                    })
                );
            });

            // Industry
            this.industry.value.forEach(i => {
                calls.push(
                    this.industryService.create({
                        instituteName: i.instituteName || null,
                        fromDate: i.fromDate ? dayjs(i.fromDate) : null,
                        toDate: i.toDate ? dayjs(i.toDate) : null,
                        years: i.years ? Number(i.years) : null,
                        months: i.months ? Number(i.months) : null,
                        applicant: applicantRef,
                        id: null,
                    })
                );
            });

            // Achievements
            if (data.achievements) {
                calls.push(
                    this.achievementService.create({
                        description: data.achievements,
                        applicant: applicantRef,
                        id: null,
                    })
                );
            }

            // Employment
            let employmentObs: any = of(null);
            if (data.employment.organizationName) {
                employmentObs = this.employmentService.create({
                    organizationName: data.employment.organizationName,
                    designation: data.employment.designation,
                    officialTelephone: data.employment.officialTelephone,
                    officialAddress: data.employment.officialAddress,
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
                            referenceNumber: paymentData.referenceNumber || null,
                            paymentDate: dayjs(),                   
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

            });
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
}