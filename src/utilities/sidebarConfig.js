import {
    FiFileText,
    FiLayers,
    FiBarChart2,
    FiBookOpen,
    FiShield,
    FiActivity
} from "react-icons/fi";

export const sidebarConfig = {
    admin: [
        {
            label: "Audit Application Management",
            icon: FiLayers,
            children: [
                {
                    label: "View/Approve Pending Audit Applications",
                    icon: FiFileText,
                    path: "/admin/pendingaudits",
                },
                {
                    label: "Assign Audit Application to Auditor",
                    icon: FiLayers,
                    path: "/admin/assignaudits",
                },
                {
                    label: "Re-assign Declined Audit Applications",
                    icon: FiLayers,
                    path: "/admin/audits/resassign/",
                },
                {
                    label: "View Rejected Audit Applications",
                    icon: FiLayers,
                    path: "/admin/rejectedaudits",
                },
                {
                    label: "View Assigned/In-Progress Audit Applications",
                    icon: FiBarChart2,
                    path: "/admin/ongoingaudits",
                },
                {
                    label: "Audit Applications Reports",
                    icon: FiBarChart2,
                    path: "/admin/reports",
                },
            ]
        },

        {
            label: "User Management",
            icon: FiBarChart2,
            path: "/admin/verify/users",
        },
        // 🔥 GROUP ITEM
        {
            label: "Checklist Management",
            icon: FiLayers,
            children: [
                { label: "Create Domain", path: "/domain/create" },
                { label: "View Domains", path: "/domain/view" },
                { label: "Create Evidence", path: "/evidence/create" },
                { label: "View Evidence", path: "/evidence/view/all" },
                { label: "Create Checklist", path: "/admin/createChecklist" },
                { label: "Manage Checklists", path: "/admin/viewChecklist" },
                { label: "Bulk Checklist Upload", path: "/admin/checklist/bulkupload/" },
            ],
        },
        // {
        //     label: "Data Breach Scanner Configuration",
        //     icon: FiShield,
        //     children: [
        //         {
        //             label: "Manage Keywords",
        //             path: "/admin/data-breach-scanner/keywords"
        //         }
        //     ]
        // }
        // {
        //     label: "Generate Report",
        //     icon: FiBarChart2,
        // },
        // {
        //     label: "Learn DPDP",
        //     icon: FiBookOpen,
        // }
    ],

    auditor: [
        // 🔥 GROUP ITEM
        {
            label: "Audit Status",
            icon: FiLayers,
            children: [
                {
                    label: "Pending Audit Applications",
                    icon: FiFileText,
                    path: '/auditor/pendingAudits',
                },
                {
                    label: "Accepted Audit Applications",
                    icon: FiFileText,
                    path: "/auditor/acceptedAudits",
                },
                {
                    label: "In Progress Audit Applications",
                    icon: FiFileText,
                    path: "/auditor/inprogress",
                },
                {
                    label: "Rejected Audit Applications",
                    icon: FiFileText,
                    path: "/auditor/declinedAudits",
                },
                {
                    label: "Completed Audit Applications",
                    icon: FiBarChart2,
                    path: "/auditor/completedaudits",
                },
            ],
        },
        {
            label: "Audit Tools",
            icon: FiLayers,
            children: [
                {
                    label: "PII-in-Transit Scanner Tool",  // Ongoing Audits
                    icon: FiLayers,
                    path: "/auditor/databreachscanner",
                },
                {
                    label: "Consent Scanner Tool",
                    icon: FiBarChart2,
                    path: "/auditor/consentscanner/"
                },
            ]
        },


        {
            label: "Learn DPDP",
            icon: FiLayers,
            path: "/learndpdp",
        },
    ],

    auditee: {
        self_check: [
            // {
            //     label: "Consent Scanner Tool",
            //     icon: FiShield,
            //     children: [
            //         {
            //             label: "Start a New Scan",
            //             icon: FiFileText,
            //             path: "/user/self-check/consent-scanner",
            //         },
            //         {
            //             label: "View Your Scans",
            //             icon: FiActivity,
            //             path: "/user/self-check/scans",
            //         },
            //     ],
            // },
            // {
            //     label: "PII-in-Transit Scanner Tool",
            //     icon: FiShield,
            //     children: [
            //         {
            //             label: "Start a New Scan",
            //             icon: FiFileText,
            //             path: "/user/self-check/data-breach-scanner",
            //         },
            //         {
            //             label: "View Your Scans",
            //             icon: FiActivity,
            //             path: "/user/self-check/breach-scans",
            //         },
            //     ],
            // },
            {
                label:"View Scans and Reports",
                icon: FiBookOpen,
                path:"/user/self-check/results"
            },
            {
                label: "Learn DPDP",
                icon: FiBookOpen,
                path: "/learndpdp",
            },
        ],

        third_party_audit: [
            {
                label: "Apply for Audit",
                icon: FiFileText,
                path: "/user/register",
            },
            {
                label: "Audit Applications",
                icon: FiShield,
                children: [
                    {
                        label: "Approved Audit Applications",
                        icon: FiLayers,
                        path: "/user/approvedaudits",
                    },
                    {
                        label: "Pending Audit Applications",
                        icon: FiLayers,
                        path: "/application/pending",
                    },
                    {
                        label: "In-progress Audit Applications",
                        icon: FiLayers,
                        path: "/application/inprogress",
                    },
                    {
                        label: "Rejected Audit Applications",
                        icon: FiLayers,
                        path: "/user/rejectedaudits",
                    },
                    {
                        label: "Completed Audit Applications Reports",
                        icon: FiBarChart2,
                        path: "/application/published-reports"
                    },
                ]
            },

            {
                label: "Learn DPDP",
                icon: FiBookOpen,
                path: "/learndpdp",
            },

        ],
    },
};