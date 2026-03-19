import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration-number-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title class="text-2xl font-bold text-yellow-800 flex items-center">
      <mat-icon class="mr-3 text-yellow-600">badge</mat-icon>
      Enter Student Registration Number
    </h2>
    <mat-dialog-content class="py-6">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
        <p class="text-gray-700 mb-4">
          Please enter the student's registration number to complete the payment approval process.
        </p>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label class="text-lg font-medium">Registration Number</mat-label>
          <input matInput [(ngModel)]="registrationNumber"
                 placeholder="Enter registration number (e.g., REG-2024-001)"
                 required
                 class="text-lg"
                 autocomplete="off">
          <mat-icon matSuffix class="text-gray-400">edit</mat-icon>
        </mat-form-field>
        <p class="text-sm text-gray-500 mt-2">
          This number will be saved with the invoice and displayed to the student.
        </p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-4 bg-gray-50 border-t">
      <button mat-button mat-dialog-close class="px-4 py-2 text-base mr-2">
        <mat-icon class="mr-2">cancel</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary"
              (click)="save()"
              [disabled]="!registrationNumber?.trim()"
              class="px-6 py-2 text-base">
        <mat-icon class="mr-2">save</mat-icon>
        Save Registration Number
      </button>
    </mat-dialog-actions>
  `,
})
export class RegistrationNumberDialogComponent {
  private dialogRef = inject(MatDialogRef<RegistrationNumberDialogComponent>);

  registrationNumber: string = '';

  save(): void {
    if (this.registrationNumber.trim()) {
      this.dialogRef.close(this.registrationNumber.trim());
    }
  }
}