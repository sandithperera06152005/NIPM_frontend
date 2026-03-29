import { Route } from "@angular/router";
import { initialDataResolver } from "app/app.resolvers";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { NoAuthGuard } from "app/core/auth/guards/noAuth.guard";
import { LayoutComponent } from "app/layout/layout.component";

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
  // Redirect empty path to '/example'
  { path: "", pathMatch: "full", redirectTo: "dashboard" },

  // Redirect signed-in user to the '/example'
  //
  // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
  // path. Below is another redirection for that path to redirect the user to the desired
  // location. This is a small convenience to keep all main routes together here on this file.
  { path: "signed-in-redirect", pathMatch: "full", redirectTo: "student-dashboard" },

  // Auth routes for guests
  {
    path: "",
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      // {
      //   path: "membership-form",
      //   loadChildren: () =>
      //     import(
      //       "app/modules/membership-public/membership-public.routes"
      //     ),
      // },
      {
        path: "membership-admission/form",
        loadChildren: () =>
          import(
            "app/modules/membership-admission/membership-admission.routes"
          ),
      },
      {
        path: "student-application-form",
        loadChildren: () =>
          import("app/modules/student-application-form/student-application-form.routes"),
      },
      {
        path: "confirmation-required",
        loadChildren: () =>
          import(
            "app/modules/landing/auth/confirmation-required/confirmation-required.routes"
          ),
      },
      {
        path: "forgot-password",
        loadChildren: () =>
          import(
            "app/modules/landing/auth/forgot-password/forgot-password.routes"
          ),
      },
      {
        path: "reset-password",
        loadChildren: () =>
          import(
            "app/modules/landing/auth/reset-password/reset-password.routes"
          ),
      },
      {
        path: "sign-in",
        loadChildren: () =>
          import("app/modules/landing/auth/sign-in/sign-in.routes"),
      },
      {
        path: "sign-up",
        loadChildren: () =>
          import("app/modules/landing/auth/sign-up/sign-up.routes"),
      },
    ],
  },

  // Auth routes for authenticated users
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "sign-out",
        loadChildren: () =>
          import("app/modules/landing/auth/sign-out/sign-out.routes"),
      },
      {
        path: "unlock-session",
        loadChildren: () =>
          import(
            "app/modules/landing/auth/unlock-session/unlock-session.routes"
          ),
      },
    ],
  },

  // Landing routes
  {
    path: "",
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "home",
        loadChildren: () => import("app/modules/landing/home/home.routes"),
      },
    ],
  },

  // Admin routes
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      {
        path: "example",
        loadChildren: () => import("app/modules/admin/example/example.routes"),
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import("app/modules/admin/dashboard/dashboard.routes"),
      },
      // {
      //   path: "membership-admission/form",
      //   loadChildren: () =>
      //     import("app/modules/membership-admission/membership-admission.routes"),
      // },
      {
        path: "student-profile",
        loadChildren: () =>
          import("app/modules/student-profile/student-profile.routes"),
      },
      // {
      //   path: "gatepass",
      //   loadChildren: () =>
      //     import("app/modules/admin/gatepass/gatepass.routes"),
      // },

      {
        path: "academic-year",
        loadChildren: () =>
          import("app/modules/academic-year/academic-year.routes"),
      },
      {
        path: "advertisement-type",
        loadChildren: () =>
          import("app/modules/advertisement-type/advertisement-type.routes"),
      },
      {
        path: "app-user",
        loadChildren: () => import("app/modules/app-user/app-user.routes"),
      },
      {
        path: "audit-log",
        loadChildren: () =>
          import("app/modules/audit-log/audit-log.routes"),
      },
      {
        path: "company",
        loadChildren: () =>
          import("app/modules/company/company.routes"),
      },
      {
        path: "company-participant",
        loadChildren: () =>
          import("app/modules/company-participant/company-participant.routes"),
      },
      {
        path: "course-reg-form",
        loadChildren: () =>
          import("app/modules/course-reg-form/course-reg-form.routes"),
      },
      {
        path: "course",
        loadChildren: () =>
          import("app/modules/course/course.routes"),
      },
      {
        path: "course-coordinator",
        loadChildren: () =>
          import("app/modules/course-coordinator/course-coordinator.routes"),
      },
      {
        path: "course-admission",
        loadChildren: () =>
          import("app/modules/course-admission/course-admission.routes"),
      },
      {
        path: "invoice",
        loadChildren: () =>
          import("app/modules/invoice/invoice.routes"),
      },
      {
        path: "membership-category",
        loadChildren: () =>
          import("app/modules/membership-category/membership-category.routes"),
      },
      {
        path: "course-admission-qualification",
        loadChildren: () =>
          import("app/modules/course-admission-qualification/course-admission-qualification.routes"),
      },
      {
        path: "student-profile",
        loadChildren: () =>
          import(
            "app/modules/student-profile/student-profile.routes"
          ),
      },
      {
        path: "membership-admission",
        loadChildren: () =>
          import(
            "app/modules/membership-admission/membership-admission.routes"
          ),
      },
      {
        path: "approvals",
        loadChildren: () =>
          import(
            "app/modules/approvals/approvals.routes"
          ),
      },
      // {
      //   path: "approvals",
      //   loadChildren: () =>
      //     import(
      //       "app/modules/membership-admission/approvals/approvals.routes"
      //     ),
      // },
      {
        path: "finance-management",
        loadChildren: () =>
          import(
            "app/modules/finance-management/finance-management.routes"
          ),
      },

      // {
      //   path: "job-cards",
      //   loadChildren: () =>
      //     import("app/modules/admin/job-cards/job-cards.routes"),
      // },



      //  { path: 'supplier', loadChildren: () => import('app/modules/admin/supplier-details/supplier.routes') },

      {
        path: "student-dashboard",
        loadChildren: () =>
          import("app/modules/student-dashboard/student-dashboard.routes"),
      },

    ],
  },
];
