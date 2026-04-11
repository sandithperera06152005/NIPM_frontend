import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'auth-change-password',
    templateUrl: './change-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthChangePasswordComponent implements OnInit, OnDestroy {
    @ViewChild('changePasswordNgForm') changePasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    changePasswordForm: UntypedFormGroup;
    showAlert = false;

    private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private readonly authService: AuthService,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.changePasswordForm = this.formBuilder.group(
            {
                currentPassword: ['', Validators.required],
                newPassword: ['', Validators.required],
                confirmPassword: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('newPassword', 'confirmPassword'),
            }
        );
    }

    ngOnDestroy(): void {
        if (this.redirectTimeoutId) {
            clearTimeout(this.redirectTimeoutId);
        }
    }

    changePassword(): void {
        if (this.changePasswordForm.invalid) {
            this.changePasswordForm.markAllAsTouched();
            return;
        }

        this.changePasswordForm.disable();
        this.showAlert = false;

        const { currentPassword, newPassword } = this.changePasswordForm.getRawValue();

        this.authService
            .changePassword({ currentPassword, newPassword })
            .pipe(
                finalize(() => {
                    if (this.alert.type === 'error') {
                        this.changePasswordForm.enable();
                    }
                    this.showAlert = true;
                })
            )
            .subscribe({
                next: () => {
                    this.alert = {
                        type: 'success',
                        message: 'Password updated successfully. Redirecting to your profile...',
                    };

                    this.changePasswordNgForm?.resetForm();
                    this.redirectTimeoutId = setTimeout(() => {
                        this.router.navigate(['/student-profile/view']);
                    }, 1500);
                },
                error: error => {
                    this.alert = {
                        type: 'error',
                        message: this.resolveErrorMessage(error),
                    };
                },
            });
    }

    private resolveErrorMessage(error: { status?: number; error?: unknown }): string {
        if (error.status === 400 || error.status === 401) {
            return 'Current password is incorrect.';
        }

        if (error.status === 403) {
            return 'You are not allowed to change this password.';
        }

        if (typeof error.error === 'string' && error.error.trim()) {
            return error.error;
        }

        const backendMessage =
            typeof error.error === 'object' && error.error !== null && 'message' in error.error
                ? String((error.error as { message?: unknown }).message ?? '')
                : '';

        return backendMessage || 'Unable to change password right now. Please try again.';
    }
}
