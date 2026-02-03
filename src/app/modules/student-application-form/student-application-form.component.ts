import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

// Angular Material Imports
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

import { ApplicantService } from 'app/entities/applicant/service/applicant.service';
import { AdvancedLevelQualificationService } from 'app/entities/advanced-level-qualification/service/advanced-level-qualification.service';
import { AdvancedLevelSubjectService } from 'app/entities/advanced-level-subject/service/advanced-level-subject.service';
import { DiplomaQualificationService } from 'app/entities/diploma-qualification/service/diploma-qualification.service';
import { IndustryExperienceService } from 'app/entities/industry-experience/service/industry-experience.service';
import { EmploymentService } from 'app/entities/employment/service/employment.service';
import { AchievementService } from 'app/entities/achievement/service/achievement.service';
import { PaymentService } from 'app/entities/payment/service/payment.service';
import { DocumentService } from 'app/entities/document/service/document.service';

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
                subjects: this.fb.array([
                    this.createSubject(),
                    this.createSubject(),
                    this.createSubject(),
                ]),
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

        // Clean up data - remove empty strings and null values
        const cleanAdvancedLevel = {
            examYear: data.advancedLevel?.examYear ? Number(data.advancedLevel.examYear) : null,
            indexNumber: data.advancedLevel?.indexNumber || null,
            stream: data.advancedLevel?.stream || null,
            medium: data.advancedLevel?.medium || null,
            zScore: data.advancedLevel?.zScore ? Number(data.advancedLevel.zScore) : null,
            subjects: data.advancedLevel?.subjects || [],
        };

        console.log('Form Data:', data);
        console.log('Advanced Level Data:', cleanAdvancedLevel);

        // Convert Date objects to dayjs format strings
        // Clean up applicant data - remove empty strings and null values
        const applicantData: any = {
            fullName: data.applicant.fullName || null,
            initialsName: data.applicant.initialsName || null,
            contactAddress: data.applicant.contactAddress || null,
            permanentAddress: data.applicant.permanentAddress || null,
            district: data.applicant.district || null,
            email: data.applicant.email || null,
            dateOfBirth: data.applicant.dateOfBirth
                ? dayjs(data.applicant.dateOfBirth).format(DATE_FORMAT)
                : null,
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

        // ATTACH employment ONLY if filled (NO id)
        // if (data.employment?.organizationName) {
        //     applicantData.employment = {
        //         organizationName: data.employment.organizationName,
        //         designation: data.employment.designation,
        //         officialTelephone: data.employment.officialTelephone,
        //         officialAddress: data.employment.officialAddress,
        //     };
        // }

        /** 1️⃣ Save Applicant FIRST */
        this.applicantService.create(applicantData).subscribe(applicantRes => {
            const applicant = applicantRes.body!;
            const applicantRef = { id: applicant.id };
            const calls = [];
            let employmentObservable = null;

            /** 2️⃣ A/L Qualification */
            const alObservable = this.alService.create({
                examYear: cleanAdvancedLevel.examYear,
                indexNumber: cleanAdvancedLevel.indexNumber,
                stream: cleanAdvancedLevel.stream,
                medium: cleanAdvancedLevel.medium,
                zScore: cleanAdvancedLevel.zScore,
                applicant: applicantRef,
                id: null
            });

            // Create A/L subjects after A/L qualification is saved
            const alSubjectsObservables = data.advancedLevel.subjects
                .filter((s: any) => s.subjectName)
                .map((s: any) =>
                    this.alSubjectService.create({
                        subjectName: s.subjectName,
                        grade: s.grade,
                        advancedLevelQualification: null, // Will be linked after alObservable completes
                        id: null
                    })
                );

            // Combine A/L qualification with its subjects
            calls.push(forkJoin([alObservable, ...alSubjectsObservables]));

            /**  Diplomas */
            data.diplomas.forEach((d: any) => {
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

            /** 4️⃣ Industry Experience */
            data.industry.forEach((i: any) => {
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

            /** 5️⃣ Employment - Create first to get ID, then link to applicant */
            if (data.employment.organizationName) {
                employmentObservable = this.employmentService.create({
                    organizationName: data.employment.organizationName || null,
                    designation: data.employment.designation || null,
                    officialTelephone: data.employment.officialTelephone || null,
                    officialAddress: data.employment.officialAddress || null,
                    id: null,
                });
            }

            /** 6️⃣ Achievements */
            if (data.achievements) {
                calls.push(
                    this.achievementService.create({
                        description: data.achievements,
                        applicant: applicantRef,
                        id: null
                    })
                );
            }

            const paymentData = this.form.value.payment;

            const paymentPayload: any = {
                paymentMethod: paymentData.paymentMethod,
                amount: paymentData.amount,
                referenceNumber: paymentData.referenceNumber || null,
                paymentDate: dayjs(),
                paymentStatus: 'PENDING',
                applicant: { id: applicant.id },
                id: null,
            };

            console.log('Payment Payload:', paymentPayload);

            this.paymentService.create(paymentPayload).subscribe(paymentRes => {
                const payment = paymentRes.body!;

                /** 8️⃣ Upload bank slip ONLY if bank transfer */
                if (paymentData.paymentMethod === 'BANK_TRANSFER' && this.selectedSlipFile) {

                    const formData = new FormData();
                    formData.append('file', this.selectedSlipFile);

                    this.documentService.upload(formData).subscribe(uploadRes => {
                        const fileUrl = uploadRes.fileUrl;

                        /** 9️⃣ Save Document */
                        this.documentService.create({
                            fileName: this.selectedSlipFile!.name,
                            fileUrl,
                            documentType: 'BANK_SLIP',
                            payment: { id: payment.id },
                            id: null,
                        }).subscribe(() => {
                            window.location.reload();
                        });
                    });

                } else {
                    window.location.reload();
                }
            });

            // Execute all calls
            forkJoin([...calls, employmentObservable].filter(Boolean)).subscribe(() => {
                // After all entities are created, update applicant with employment link
                if (employmentObservable) {
                    employmentObservable.subscribe(employmentRes => {
                        const employment = employmentRes.body!;
                        this.applicantService.update({
                            ...applicant,
                            employment: { id: employment.id },
                        }).subscribe(() => {
                            window.location.reload();
                        });
                    });
                } else {
                    window.location.reload();
                }
            });
        });

        console.log('Form Data Submitted: ', data);
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
