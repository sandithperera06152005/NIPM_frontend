import { Routes } from "@angular/router";
import { FinanceManagementComponent } from "./finance-management.component";
import { FinanceManagementViewComponent } from "../finance-management-view/finance-management-view.component";

export const financeManagementRoute: Routes = [
    {
        path: "",
        component: FinanceManagementComponent,
    },
    {
        path: "view/:id",
        component: FinanceManagementViewComponent,
    },
];

export default financeManagementRoute;
