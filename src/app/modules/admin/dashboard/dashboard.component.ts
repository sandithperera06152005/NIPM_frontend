import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs/esm';

import { AcademicYearService } from 'app/modules/academic-year/service/academic-year.service';
import { IAcademicYear } from 'app/modules/academic-year/academic-year.model';

import { AppUserService } from 'app/modules/app-user/service/app-user.service';
import { IAppUser } from 'app/modules/app-user/app-user.model';
import { UserStatus } from 'app/enums/user-status.model';
import { CompanyService } from 'app/modules/company/service/company.service';
import { ICompany } from 'app/modules/company/company.model';
import { CourseService } from 'app/modules/course/service/course.service';
import { ICourse } from 'app/modules/course/course.model';
import { CourseAdmissionService } from 'app/modules/course-admission/service/course-admission.service';
import { ICourseAdmission } from 'app/modules/course-admission/course-admission.model';
import { ApplicationStatus } from 'app/enums/application-status.model';
import { AuditLogService } from 'app/modules/audit-log/service/audit-log.service';
import { IAuditLog } from 'app/modules/audit-log/audit-log.model';
import { StudentProfileService } from 'app/modules/student-profile/service/student-profile.service';
import { IStudentProfile } from 'app/modules/student-profile/student-profile.model';
import { EnrollmentStatus } from 'app/enums/enrollment-status.model';


import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule,
    MatIconModule

  ],
})
export class DashboardComponent implements OnInit {
  recentApplications: { id: string; status: string }[] = [];
  recentStudents: { id: string; name: string; status: string }[] = [];
  recentAuditLogs: { action: string; entityName: string }[] = [];
  recentAppUsers: { name: string; status: string }[] = [];
  recentCompanies: { name: string; status: string }[] = [];
  recentCourses: { name: string; status: string }[] = [];
  recentCourseAdmissions: { id: string; status: string }[] = [];
  stats = {
    academicYears: 0,
    appUsers: 0,
    companies: 0,
    courses: 0,
    courseAdmissions: 0,
  };

  constructor(
    private academicYearService: AcademicYearService,
    private auditLogService: AuditLogService,
    private appUserService: AppUserService,
    private companyService: CompanyService,
    private courseService: CourseService,
    private courseAdmissionService: CourseAdmissionService,
    private studentProfileService: StudentProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAcademicYears();
    this.loadAppUsers();
    this.loadCompanies();
    this.loadCourses();
    this.loadCourseAdmissions();
    this.loadStudentProfiles();
    this.loadStats();
    this.loadAuditLogs();
  }

  // ================================
  // Dashboard Data
  // ================================
  private loadAcademicYears(): void {
    this.academicYearService.query().subscribe({
      next: res => {
        const academicYears = res.body ?? [];

        this.recentApplications = academicYears.map(ay => ({
          id: String(ay.id),
          status: this.getAcademicYearStatus(ay),
        }));

        this.stats.academicYears = academicYears.length;
      },
      error: err => console.error('Failed to load academic years', err),
    });
  }

  private loadAuditLogs(): void {
    this.auditLogService.query({ size: 10, sort: ['performedAt,desc'] }).subscribe({
      next: res => {
        const logs = res.body ?? [];

        this.recentAuditLogs = logs.map(log => ({
          action: String(log.action ?? 'Unknown action'),
          entityName: String(log.entityName ?? 'Unknown entity'),
        }));
      },
      error: err => console.error('Failed to load audit logs', err),
    });
  }


  private loadAppUsers(): void {
    this.appUserService.query().subscribe({
      next: res => {
        const appUsers = res.body ?? [];

        this.recentAppUsers = appUsers.map(user => ({
          name: (user.firstName || '') + ' ' + (user.lastName || ''),
          status: user.status === UserStatus.ACTIVE ? 'Active' : 'Inactive',
        }));
      },
      error: err => console.error('Failed to load app users', err),
    });
  }

  private loadCompanies(): void {
    this.companyService.query().subscribe({
      next: res => {
        const companies = res.body ?? [];

        this.recentCompanies = companies.map(company => ({
          name: (company.companyName as string) || '',
          status: company.status === 'ACTIVE' ? 'Active' : 'Inactive',
        }));
      },
      error: err => console.error('Failed to load companies', err),
    });
  }

  private loadCourses(): void {
    this.courseService.query().subscribe({
      next: res => {
        const courses = res.body ?? [];

        this.recentCourses = courses.map(course => ({
          name: (course.title as string) || '',
          status: course.active ? 'Active' : 'Inactive',
        }));
      },
      error: err => console.error('Failed to load courses', err),
    });
  }

  private loadCourseAdmissions(): void {
    this.courseAdmissionService.query().subscribe({
      next: res => {
        const courseAdmissions = res.body ?? [];

        this.recentCourseAdmissions = courseAdmissions.map(admission => ({
          id: String(admission.id),
          status: this.mapAdmissionStatus(admission.status),
        }));
      },
      error: err => console.error('Failed to load course admissions', err),
    });
  }

  private loadStudentProfiles(): void {
    this.studentProfileService.query().subscribe({
      next: res => {
        const studentProfiles = res.body ?? [];

        this.recentStudents = studentProfiles
          .filter(student => student.enrollmentStatus === EnrollmentStatus.PENDING)
          .map(student => ({
            id: String(student.id),
            name: (student.studentName as string) || '',
            status: this.mapEnrollmentStatus(student.enrollmentStatus),
          }));
      },
      error: err => console.error('Failed to load student profiles', err),
    });
  }

  private mapAdmissionStatus(status: ApplicationStatus | null): string {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'Pending';
      case ApplicationStatus.APPROVED:
        return 'Approved';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      case ApplicationStatus.SUBMITTED:
        return 'Submitted';
      default:
        return 'Unknown';
    }
  }

  private mapEnrollmentStatus(status: EnrollmentStatus | null): string {
    switch (status) {
      case EnrollmentStatus.PENDING:
        return 'Pending';
      case EnrollmentStatus.ENROLLED:
        return 'Enrolled';
      case EnrollmentStatus.WITHDRAWN:
        return 'Withdrawn';
      case EnrollmentStatus.GRADUATED:
        return 'Graduated';
      case EnrollmentStatus.SUSPENDED:
        return 'Suspended';
      default:
        return 'Unknown';
    }
  }

  private getAcademicYearStatus(ay: IAcademicYear): string {
    const today = dayjs();

    if (ay.startDate && today.isBefore(ay.startDate)) {
      return 'Upcoming';
    }

    if (
      ay.startDate &&
      ay.endDate &&
      today.isAfter(ay.startDate) &&
      today.isBefore(ay.endDate)
    ) {
      return 'Active';
    }

    if (ay.endDate && today.isAfter(ay.endDate)) {
      return 'Completed';
    }

    return 'Unknown';
  }

  private loadStats(): void {
    this.academicYearService.query().subscribe({
      next: res => {
        this.stats.academicYears = res.body?.length || 0;
      },
      error: err => console.error('Failed to load academic years count', err),
    });

    this.appUserService.query().subscribe({
      next: res => {
        this.stats.appUsers = res.body?.length || 0;
      },
      error: err => console.error('Failed to load app users count', err),
    });

    this.companyService.query().subscribe({
      next: res => {
        this.stats.companies = res.body?.length || 0;
      },
      error: err => console.error('Failed to load companies count', err),
    });

    this.courseService.query().subscribe({
      next: res => {
        this.stats.courses = res.body?.length || 0;
      },
      error: err => console.error('Failed to load courses count', err),
    });

    this.courseAdmissionService.query().subscribe({
      next: res => {
        this.stats.courseAdmissions = res.body?.length || 0;
      },
      error: err => console.error('Failed to load course admissions count', err),
    });
  }

  // ================================
  // Quick Actions (Button Handlers)
  // ================================

  createAcademicYear(): void {
    // Later route to academic year create page
    console.log('Create Academic Year clicked');
    this.router.navigate(['/academic-year/new']);
  }

  reviewApplications(): void {
    console.log('Review Applications clicked');
    this.router.navigate(['/admissions/applications']);
  }

  addAppUser(): void {
    console.log('Add App User clicked');
    this.router.navigate(['/admin/user-management']);
  }

  manageBankAccounts(): void {
    console.log('Manage Bank Accounts clicked');
    this.router.navigate(['/banks']);
  }
}
