import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { Account } from "app/core/auth/account.model";
import { AccountService } from "app/core/auth/account.service";
import { Location } from "@angular/common";
import { LoginService } from "app/login/login.service";
// import { KeycloakService } from "app/core/auth/keycloak.service";

@Component({
  selector: "auth-sign-in",
  templateUrl: "./sign-in.component.html",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [
    RouterLink,
    // FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
})
export class AuthSignInComponent implements OnInit {
  @ViewChild("signInNgForm") signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  signInForm: UntypedFormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _accountService: AccountService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.signInForm = this._formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required],
      rememberMe: [""],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Sign in
   */
  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }

    // Disable the form
    this.signInForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Sign in
    this._authService.signIn(this.signInForm.value).subscribe(
      () => {
        const requestedRedirectURL =
          this._activatedRoute.snapshot.queryParamMap.get("redirectURL");

        if (requestedRedirectURL) {
          this._router.navigateByUrl(requestedRedirectURL);
          return;
        }

        this._accountService.identity(true).subscribe(account => {
          this._router.navigateByUrl(this._resolveDefaultRedirect(account));
        });
      },
      (response) => {
        // Re-enable the form
        this.signInForm.enable();

        // Reset the form
        this.signInNgForm.resetForm();

        // Set the alert
        this.alert = {
          type: "error",
          message: "Wrong email or password",
        };

        // Show the alert
        this.showAlert = true;
      }
    );
  }

  private _resolveDefaultRedirect(account: Account | null): string {
    const authorities = account?.authorities ?? [];

    if (authorities.includes("ROLE_STUDENT")) {
      return "/student-dashboard";
    }

    return "/dashboard";
  }
}
