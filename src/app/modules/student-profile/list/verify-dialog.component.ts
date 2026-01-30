import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IStudentProfile } from '../student-profile.model';
import { StudentProfileService } from '../service/student-profile.service';
import { EnrollmentStatus } from '../../../enums/enrollment-status.model';

@Component({
    selector: 'app-verify-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions],
    templateUrl: './verify-dialog.component.html',
    styleUrls: ['./verify-dialog.component.scss'],
})
export class VerifyDialogComponent {
    private dialogRef = inject(MatDialogRef<VerifyDialogComponent>);
    private data = inject(MAT_DIALOG_DATA) as { student: IStudentProfile };
    private service = inject(StudentProfileService);

    student = this.data.student;

    approve() {
        if (this.student.id) {
            const updated = { ...this.student, enrollmentStatus: EnrollmentStatus.ENROLLED };
            this.service.update(updated).subscribe(() => {
                this.dialogRef.close(true);
            });
        }
    }

    close() {
        this.dialogRef.close();
    }
}