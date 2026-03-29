import { Routes } from "@angular/router";
import { FinanceManagementComponent } from "./finance-management.component";
import { FinanceManagementViewComponent } from "../finance-management-view/finance-management-view.component";
import { UserRouteAccessService } from "app/core/auth/user-route-access.service";

export const financeManagementRoute: Routes = [
    {
        path: "",
        component: FinanceManagementComponent,
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER'] }
    },
    {
        path: "view/:id",
        component: FinanceManagementViewComponent,
        canActivate: [UserRouteAccessService],
        data: { authorities: ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER'] }
    },
];

export default financeManagementRoute;
