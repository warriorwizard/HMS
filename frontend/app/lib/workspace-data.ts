export type RiskLevel = "Critical" | "High" | "Moderate" | "Low";

export type Metric = {
  label: string;
  value: string;
  trend: string;
};

export const navItems = [
  { label: "Command", href: "/doctor/command-center" },
  { label: "Patients", href: "/patients" },
  { label: "Reports", href: "/reports" },
  { label: "Workflow", href: "/workflow" },
  { label: "Analytics", href: "/analytics" },
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
