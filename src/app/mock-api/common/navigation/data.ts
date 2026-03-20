/* eslint-disable */
import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: "operation-module",
    title: "NIPM operations",
    subtitle: "Frequently used features for operations",
    type: "collapsable",
    icon: "heroicons_outline:cog",
    children: [
      {
        id: "dashboard",
        title: "Dashboard",
        type: "basic",
        icon: "heroicons_outline:chart-pie",
        link: "/dashboard",
      },
      {
        id: "student-dashboard",
        title: "Student Dashboard",
        type: "basic",
        icon: "heroicons_outline:home",
        link: "/student-dashboard",
      },
      {
        id: "manage-payments",
        title: "Manage Payments",
        type: "basic",
        icon: "heroicons_outline:currency-dollar",
        link: "/student-dashboard/manage-payments",
      },
      // {
      //   id: "student-dashboard",
      //   title: "Student Dashboard",
      //   type: "collapsable",
      //   icon: "heroicons_outline:chart-pie",
      //   children: [


      //   ],
      // },
      // {
      //   id: "student",
      //   title: "Student",
      //   type: "basic",
      //   icon: "heroicons_outline:academic-cap",
      //   link: "/student-profile",
      // },
      {
        id: "student-admission",
        title: "Student Admission",
        type: "basic",
        icon: "heroicons_outline:user-plus",
        link: "/course-admission",
      },
      {
        id: "membership-admission",
        title: "Members Admission",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/membership-admission",
      },
      {
        id: "approval",
        title: "Approvals",
        type: "basic",
        icon: "heroicons_outline:check-circle",
        link: "/approvals",
      },
      {
        id: "finance-management",
        title: "Finance Management",
        type: "basic",
        icon: "heroicons_outline:currency-dollar",
        link: "/finance-management",
      },
      {
        id: "company",
        title: "Company",
        type: "basic",
        icon: "heroicons_outline:building-office",
        link: "/company",
      },
      {
        id: "course-reg-form",
        title: "Course Registration Forms",
        type: "basic",
        icon: "heroicons_outline:chart-pie",
        link: "/course-reg-form",
      },
      {
        id: "course-coordinator",
        title: "Course Coordinator",
        type: "basic",
        icon: "heroicons_outline:user",
        link: "/course-coordinator",
      },
      {
        id: "membership-category",
        title: "Membership Category",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/membership-category",
      },
      {
        id: "course",
        title: "Course",
        type: "basic",
        icon: "heroicons_outline:book-open",
        link: "/course",
      },

      {
        id: "invoice",
        title: "Invoice",
        type: "basic",
        icon: "heroicons_outline:receipt-refund",
        link: "/invoice",
      },
    ],
  },
  // {
  //   id: "management-module",
  //   title: "NIPM Management",
  //   subtitle: "Frequently used features for managements",
  //   type: "collapsable",
  //   icon: "heroicons_outline:cog",
  //   children: [
  //     // {
  //     //   id: "Academic Year",
  //     //   title: "Academic Year",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/academic-year",
  //     // },
  //     // {
  //     //   id: "advertisement-type",
  //     //   title: "Advertisement Type",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/advertisement-type",
  //     // },
  //     // {
  //     //   id: "app-user",
  //     //   title: "App User",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/app-user",
  //     // },
  //     // {
  //     //   id: "audit-log",
  //     //   title: "Audit Log",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/audit-log",
  //     // },

  //     // {
  //     //   id: "company-participant",
  //     //   title: "Company Participant",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/company-participant",
  //     // },

  //     // {
  //     //   id: "course-application",
  //     //   title: "Course Application",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/course-application",
  //     // },


  //     // {
  //     //   id: "course-admission-qualification",
  //     //   title: "Course Admission Qualification",
  //     //   type: "basic",
  //     //   icon: "heroicons_outline:chart-pie",
  //     //   link: "/course-admission-qualification",
  //     // },

  //   ],
  // },

  // {
  //   id: "inventory",
  //   title: "Inventory",
  //   subtitle: "Frequent actions for managing stock",
  //   type: "collapsable",
  //   icon: "inventory",
  //   children: [
  //     {
  //       id: "stock-management",
  //       title: "Stock Management",
  //       subtitle: "Manage stock and goods",
  //       type: "group",
  //       icon: "heroicons_outline:archive-box",
  //       children: [
  //         {
  //           id: "supplier",
  //           title: "View Supplier",
  //           type: "basic",
  //           icon: "heroicons_outline:user-group",
  //           link: "/supplier",
  //         },

  //       ],
  //     },
  //     {
  //       id: "records-management",
  //       title: "Records & Categories",
  //       subtitle: "Documents and classifications",
  //       type: "group",
  //       icon: "heroicons_outline:clipboard-document-list",
  //       children: [
  //         {
  //           id: "bin-card",
  //           title: "Bin Card",
  //           type: "basic",
  //           icon: "heroicons_outline:clipboard-document-list",
  //           link: "/bin-card",
  //         },
  //         {
  //           id: "category",
  //           title: "Category",
  //           type: "basic",
  //           icon: "heroicons_outline:tag",
  //           link: "/category",
  //         },
  //       ],
  //     },
  //   ],
  // },

  // {
  //   id: "inventory1",
  //   title: "Finance",
  //   subtitle: "Frequent actions for managing finance",
  //   type: "collapsable",
  //   icon: "inventory",
  //   children: [
  //     {
  //       id: "stock-management1",
  //       title: "finance Management",
  //       subtitle: "Manage finance",
  //       type: "group",
  //       icon: "heroicons_outline:archive-box",
  //       children: [
  //         {
  //           id: "supplier1",
  //           title: "Transaction",
  //           type: "basic",
  //           icon: "heroicons_outline:document-text",
  //           link: "/transaction"
  //         },
  //       ]
  //     }
  //   ]
  // }

];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: "example",
    title: "Example",
    type: "basic",
    icon: "heroicons_outline:chart-pie",
    link: "/example",
  },
];
