import { Routes } from "@angular/router";
import { StudentApplicationFormComponent } from "app/modules/student-application-form/student-application-form.component";

export const studentApplicationFormRoute: Routes = [
    {
        path: "",
        component: StudentApplicationFormComponent,
    },
];

export default studentApplicationFormRoute;
