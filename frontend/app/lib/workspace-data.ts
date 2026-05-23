import { type NavItem } from "@/app/lib/permissions";

export type { NavItem };

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

export type CrmFunnelStage = {
  stage: string;
  leads: number;
  conversion: number;
  owner: string;
  trend: string;
};

export type CrmHealthRow = {
  segment: string;
  coverage: string;
  responseSla: string;
  health: string;
  tone: StatusTone;
  note: string;
};

export type B2BBillingBreakdownRow = {
  segment: string;
  partners: string;
  invoices: string;
  billed: string;
  collected: string;
  outstanding: string;
  overdueShare: string;
  status: string;
  tone: StatusTone;
};

export type B2BAgingBucket = {
  bucket: string;
  amount: string;
  accounts: string;
  trend: string;
  tone: StatusTone;
  note: string;
};

export const navItems: NavItem[] = [
  { label: "Command",       href: "/doctor/command-center", requiredPermission: "patients:read" },
  { label: "Patient Portal", href: "/patient-portal",       requiredPermission: "patients:read" },
  { label: "Patients",      href: "/patients",              requiredPermission: "patients:read" },
  { label: "Reports",       href: "/reports",               requiredPermission: "reports:read" },
  { label: "Workflow",      href: "/workflow",              requiredPermission: "workflow:read" },
  { label: "LIMS",          href: "/lims",                  requiredPermission: "workflow:read" },
  { label: "RIS",           href: "/ris",                   requiredPermission: "workflow:read" },
  { label: "PACS Viewer",   href: "/pacs/viewer",           requiredPermission: "reports:read" },
  { label: "AI Intelligence", href: "/ai-intelligence",     requiredPermission: "analytics:read" },
  { label: "Copilot",       href: "/copilot",               requiredPermission: "patients:read" },
  { label: "Analytics",     href: "/analytics",             requiredPermission: "analytics:read" },
  { label: "Notifications", href: "/notifications" },
  { label: "CRM",           href: "/crm",                   requiredPermission: "patients:read" },
  { label: "Campaigns",     href: "/crm/campaigns",         requiredPermission: "patients:read" },
  { label: "CRM Dashboard", href: "/crm/dashboard",         requiredPermission: "analytics:read" },
  { label: "B2B Partners",  href: "/b2b/partners",          requiredPermission: "billing:read" },
  { label: "B2B Orders",    href: "/b2b/orders",            requiredPermission: "billing:read" },
  { label: "B2B Billing",   href: "/b2b/billing",           requiredPermission: "billing:read" },
  { label: "Billing Desk",  href: "/billing",               requiredPermission: "billing:read" },
  { label: "Tenants",       href: "/admin/tenants",         requiredPermission: "admin:read" },
  { label: "User Roles",    href: "/admin/users",           requiredPermission: "admin:read" },
  { label: "Admin Ops",     href: "/admin/operations",      requiredPermission: "admin:read" },
  { label: "Configuration", href: "/admin/configuration",   requiredPermission: "admin:read" },
  { label: "Settings",      href: "/settings" },
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

export const crmDashboardMetrics: Metric[] = [
  { label: "New leads", value: "412", trend: "+38 this week" },
  { label: "Qualified pipeline", value: "167", trend: "41% qualification rate" },
  { label: "Opportunity value", value: "INR 2.7M", trend: "+11% vs last sprint" },
  { label: "Won this month", value: "39", trend: "23% close rate" }
];

export const crmFunnelStages: CrmFunnelStage[] = [
  { stage: "Inbound leads", leads: 412, conversion: 100, owner: "Demand Ops", trend: "+9% weekly" },
  { stage: "Marketing qualified", leads: 260, conversion: 63, owner: "Growth", trend: "+6% weekly" },
  { stage: "Sales qualified", leads: 167, conversion: 41, owner: "BD team", trend: "+4% weekly" },
  { stage: "Proposal shared", leads: 91, conversion: 22, owner: "Account execs", trend: "+2% weekly" },
  { stage: "Closed won", leads: 39, conversion: 9, owner: "Regional leads", trend: "+1% weekly" }
];

export const crmHealthRows: CrmHealthRow[] = [
  {
    segment: "Enterprise hospitals",
    coverage: "23 accounts",
    responseSla: "2h 18m avg",
    health: "Stable",
    tone: "good",
    note: "Decision-maker engagement is consistent across top targets."
  },
  {
    segment: "Multi-clinic groups",
    coverage: "41 accounts",
    responseSla: "5h 06m avg",
    health: "At risk",
    tone: "warning",
    note: "Follow-up lag on procurement questions is slowing conversions."
  },
  {
    segment: "Diagnostic centers",
    coverage: "58 accounts",
    responseSla: "7h 42m avg",
    health: "Escalated",
    tone: "danger",
    note: "Price sensitivity is high; discount guardrails need review."
  }
];

export const crmWatchlist = [
  {
    title: "Nurture flow saturation",
    detail: "Email sequence #4 has 28% lower click-through in the South region."
  },
  {
    title: "Lead qualification drift",
    detail: "19 opportunities are waiting for updated budget and timeline fields."
  },
  {
    title: "Renewal window opening",
    detail: "12 existing tenants enter renewal discussions within the next 14 days."
  }
];

export const b2bBillingMetrics: Metric[] = [
  { label: "Gross billed (MTD)", value: "INR 9.4M", trend: "+12% vs Apr" },
  { label: "Collections posted", value: "INR 7.8M", trend: "83% realization" },
  { label: "Outstanding", value: "INR 1.6M", trend: "INR 540k > 30 days" },
  { label: "Dispute queue", value: "19", trend: "7 need partner follow-up" }
];

export const b2bBillingBreakdownRows: B2BBillingBreakdownRow[] = [
  {
    segment: "Hospital networks",
    partners: "18 partners",
    invoices: "204",
    billed: "INR 4.1M",
    collected: "INR 3.5M",
    outstanding: "INR 640k",
    overdueShare: "11%",
    status: "Stable",
    tone: "good"
  },
  {
    segment: "Enterprise diagnostics",
    partners: "26 partners",
    invoices: "281",
    billed: "INR 3.0M",
    collected: "INR 2.2M",
    outstanding: "INR 810k",
    overdueShare: "24%",
    status: "Watch",
    tone: "warning"
  },
  {
    segment: "Clinic chains",
    partners: "34 partners",
    invoices: "337",
    billed: "INR 1.6M",
    collected: "INR 1.3M",
    outstanding: "INR 270k",
    overdueShare: "15%",
    status: "Recovering",
    tone: "neutral"
  },
  {
    segment: "Referral affiliates",
    partners: "41 partners",
    invoices: "158",
    billed: "INR 780k",
    collected: "INR 710k",
    outstanding: "INR 70k",
    overdueShare: "8%",
    status: "Healthy",
    tone: "good"
  }
];

export const b2bAgingBuckets: B2BAgingBucket[] = [
  {
    bucket: "0-30 days",
    amount: "INR 1.05M",
    accounts: "74 partner accounts",
    trend: "+6% this week",
    tone: "warning",
    note: "Most pending invoices are tied to weekly bulk reconciliations."
  },
  {
    bucket: "31-60 days",
    amount: "INR 410k",
    accounts: "23 partner accounts",
    trend: "-4% this week",
    tone: "warning",
    note: "Collections improving after rolling out consolidated statement packs."
  },
  {
    bucket: "60+ days",
    amount: "INR 130k",
    accounts: "9 partner accounts",
    trend: "-11% this week",
    tone: "danger",
    note: "Escalations are active with legal-approved payment plans."
  }
];

export const b2bSettlementHighlights = [
  {
    title: "Apex Hospitals settlement posted",
    detail: "INR 420k received across 17 invoices; 100% mapped in ledger."
  },
  {
    title: "Nova Diagnostics dispute resolved",
    detail: "Rate-card mismatch fixed and INR 96k credit note issued."
  },
  {
    title: "SouthZone clinic cycle started",
    detail: "36 invoices moved to review with payment ETA between Tue-Wed."
  }
];

export const b2bBillingActionChecklist = [
  "Escalate enterprise diagnostic partners with overdue share above 20%",
  "Release weekly consolidated statements before 17:00 IST",
  "Review unresolved disputes older than five business days"
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
