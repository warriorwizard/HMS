export type RiskLevel = "Critical" | "High" | "Moderate" | "Low";

export type Metric = {
  label: string;
  value: string;
  trend: string;
};

export type StatusTone = "good" | "warning" | "danger" | "neutral";

export type StaffPerformanceRow = {
  staff: string;
  role: string;
  handled: string;
  sla: string;
  quality: string;
  status: string;
  tone: StatusTone;
  focus: string;
};

export type AdminConfigurationField = {
  name: string;
  value: string;
  status: string;
  tone: StatusTone;
  note: string;
};

export type AdminConfigurationSection = {
  title: string;
  meta: string;
  description: string;
  fields: AdminConfigurationField[];
};

export const navItems = [
  { label: "Command", href: "/doctor/command-center" },
  { label: "Patients", href: "/patients" },
  { label: "Reports", href: "/reports" },
  { label: "Workflow", href: "/workflow" },
  { label: "Analytics", href: "/analytics" },
  { label: "Tenants", href: "/admin/tenants" },
  { label: "User Roles", href: "/admin/users" },
  { label: "Admin Ops", href: "/admin/operations" },
  { label: "Configuration", href: "/admin/configuration" },
  { label: "Settings", href: "/settings" }
];

export const commandMetrics: Metric[] = [
  { label: "Active cases", value: "128", trend: "+14 today" },
  { label: "Critical pending", value: "06", trend: "2 breached" },
  { label: "Avg review time", value: "18m", trend: "-7m vs last week" },
  { label: "Follow-up risk", value: "21%", trend: "9 patients" }
];

export const queueItems = [
  {
    patient: "Asha R.",
    visit: "Radiology review",
    risk: "Critical" as RiskLevel,
    status: "Ready for doctor",
    due: "08 min",
    owner: "Dr. Mehra",
    signal: "New opacity flagged on chest X-ray"
  },
  {
    patient: "Kiran M.",
    visit: "Lab progression",
    risk: "High" as RiskLevel,
    status: "AI summary ready",
    due: "24 min",
    owner: "Dr. Iyer",
    signal: "CRP and neutrophil trend rising"
  },
  {
    patient: "Nisha P.",
    visit: "Follow-up review",
    risk: "Moderate" as RiskLevel,
    status: "Needs call",
    due: "2 hr",
    owner: "Care desk",
    signal: "Missed ultrasound follow-up window"
  }
];

export const workflowSteps = [
  { label: "Registration", count: 18, state: "Stable" },
  { label: "Billing", count: 9, state: "Clean" },
  { label: "Uploads", count: 27, state: "Delayed" },
  { label: "AI Review", count: 16, state: "Running" },
  { label: "Doctor Review", count: 11, state: "Priority" },
  { label: "Follow-up", count: 32, state: "Watch" }
];

export const patients = [
  {
    id: "TAR-P-1042",
    name: "Asha Rao",
    age: 54,
    sex: "F",
    lastVisit: "Today, 09:42",
    condition: "Pulmonary review",
    risk: "Critical" as RiskLevel,
    nextAction: "Doctor review"
  },
  {
    id: "TAR-P-1038",
    name: "Kiran Mehta",
    age: 61,
    sex: "M",
    lastVisit: "Today, 08:15",
    condition: "Inflammation trend",
    risk: "High" as RiskLevel,
    nextAction: "Compare labs"
  },
  {
    id: "TAR-P-1021",
    name: "Nisha Patel",
    age: 38,
    sex: "F",
    lastVisit: "Yesterday, 17:20",
    condition: "Abdominal imaging",
    risk: "Moderate" as RiskLevel,
    nextAction: "Follow-up call"
  },
  {
    id: "TAR-P-1009",
    name: "Omar Khan",
    age: 46,
    sex: "M",
    lastVisit: "Yesterday, 13:10",
    condition: "Diabetes panel",
    risk: "Low" as RiskLevel,
    nextAction: "Routine review"
  }
];

export const reports = [
  {
    id: "RPT-8221",
    patient: "Asha Rao",
    type: "Chest X-ray",
    source: "Radiology",
    status: "AI triaged",
    turnaround: "11 min",
    risk: "Critical" as RiskLevel
  },
  {
    id: "RPT-8215",
    patient: "Kiran Mehta",
    type: "CBC + CRP",
    source: "Pathology",
    status: "Needs doctor sign-off",
    turnaround: "26 min",
    risk: "High" as RiskLevel
  },
  {
    id: "RPT-8199",
    patient: "Nisha Patel",
    type: "Ultrasound abdomen",
    source: "Imaging",
    status: "Uploaded",
    turnaround: "2 hr",
    risk: "Moderate" as RiskLevel
  }
];

export const analyticsMetrics: Metric[] = [
  { label: "Review SLA", value: "87%", trend: "+5% this week" },
  { label: "AI coverage", value: "72%", trend: "Reports with summaries" },
  { label: "Escalation load", value: "14", trend: "6 clinical, 8 ops" },
  { label: "No-show risk", value: "9", trend: "Patients to contact" }
];

export const analyticsBars = [
  { label: "Radiology", value: 82 },
  { label: "Pathology", value: 64 },
  { label: "Follow-up", value: 48 },
  { label: "Billing", value: 31 }
];

export const operationsMetrics: Metric[] = [
  { label: "Open operational tickets", value: "37", trend: "11 due in < 2 hours" },
  { label: "Shift coverage", value: "93%", trend: "2 roles need backup" },
  { label: "First response SLA", value: "89%", trend: "+4% vs yesterday" },
  { label: "Escalations today", value: "8", trend: "3 pending manager action" }
];

export const staffPerformanceRows: StaffPerformanceRow[] = [
  {
    staff: "M. Dsouza",
    role: "Front desk lead",
    handled: "42 requests",
    sla: "94% in 15 min",
    quality: "98% accurate tags",
    status: "On target",
    tone: "good",
    focus: "Monitor walk-in surge after 17:00."
  },
  {
    staff: "A. Reddy",
    role: "Billing coordinator",
    handled: "28 requests",
    sla: "81% in 15 min",
    quality: "95% clean claims",
    status: "Watch",
    tone: "warning",
    focus: "Backlog linked to insurer portal timeout."
  },
  {
    staff: "S. Menon",
    role: "Lab operations",
    handled: "33 requests",
    sla: "88% in 15 min",
    quality: "97% specimen mapping",
    status: "Recovering",
    tone: "neutral",
    focus: "Night shift handoff notes now standardized."
  },
  {
    staff: "P. Kaur",
    role: "Care desk",
    handled: "19 requests",
    sla: "62% in 15 min",
    quality: "91% follow-up closure",
    status: "Escalated",
    tone: "danger",
    focus: "Two agents absent, reroute callback queue."
  }
];

export const operationsHandoffs = [
  {
    title: "Billing exceptions",
    owner: "Finance pod",
    status: "In progress",
    tone: "warning" as StatusTone,
    note: "7 invoices require manual policy code mapping."
  },
  {
    title: "Imaging upload lag",
    owner: "Radiology desk",
    status: "Stable",
    tone: "good" as StatusTone,
    note: "Average upload delay reduced to 11 minutes."
  },
  {
    title: "Follow-up callbacks",
    owner: "Care desk",
    status: "Needs support",
    tone: "danger" as StatusTone,
    note: "14 high-risk callbacks pending in today's queue."
  }
];

export const adminConfigurationSections: AdminConfigurationSection[] = [
  {
    title: "Service Catalog",
    meta: "12 active services",
    description: "Control naming, SLA targets, and workflow route for each service line.",
    fields: [
      {
        name: "Radiology review package",
        value: "Enabled | SLA 30 minutes | Route: Imaging lane",
        status: "Synced",
        tone: "good",
        note: "Last updated 09:12 by admin."
      },
      {
        name: "Lab panel express",
        value: "Enabled | SLA 20 minutes | Route: Pathology lane",
        status: "Draft update",
        tone: "warning",
        note: "Waiting for clinical sign-off."
      }
    ]
  },
  {
    title: "Price Rules",
    meta: "4 pending approvals",
    description: "Define consultation and test pricing with payer-specific overrides.",
    fields: [
      {
        name: "General consultation",
        value: "Base 600 INR | Follow-up 350 INR",
        status: "Synced",
        tone: "good",
        note: "No conflicts detected."
      },
      {
        name: "Emergency surcharge",
        value: "15% add-on after 22:00",
        status: "Needs approval",
        tone: "danger",
        note: "Finance and compliance review required."
      }
    ]
  },
  {
    title: "Departments",
    meta: "8 mapped departments",
    description: "Maintain department ownership, escalation matrix, and staffing thresholds.",
    fields: [
      {
        name: "Pathology",
        value: "Lead: Dr. Iyer | Escalation window: 25 minutes",
        status: "Healthy",
        tone: "good",
        note: "Coverage complete across all shifts."
      },
      {
        name: "Care coordination",
        value: "Lead: R. Shah | Escalation window: 15 minutes",
        status: "Capacity risk",
        tone: "warning",
        note: "Two open positions this week."
      }
    ]
  },
  {
    title: "Modalities",
    meta: "6 modality profiles",
    description: "Set ingestion defaults and quality checks for imaging and lab modalities.",
    fields: [
      {
        name: "X-ray (DICOM)",
        value: "Auto-tag enabled | AI pre-triage active",
        status: "Synced",
        tone: "good",
        note: "Last QC pass: 99.1%."
      },
      {
        name: "Ultrasound exports",
        value: "Manual metadata check before routing",
        status: "Review cycle",
        tone: "neutral",
        note: "Policy refresh scheduled for next sprint."
      }
    ]
  }
];

export const settingsGroups = [
  {
    title: "Tenant setup",
    items: ["Apollo Demo Center", "India time zone", "Clinical review mode enabled"]
  },
  {
    title: "Role permissions",
    items: ["Doctor can sign reports", "Technician can upload studies", "Staff can schedule follow-ups"]
  },
  {
    title: "AI governance",
    items: ["Human approval required", "Source-linked outputs only", "Audit logging active"]
  }
];
