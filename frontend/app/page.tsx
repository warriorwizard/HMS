import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/app/components/app-shell";

const screenEntries = [
  {
    href: "/patient-portal",
    title: "Patient Facing Health Portal",
    subtitle: "patient_facing_health_portal_16_9"
  },
  {
    href: "/doctor/command-center",
    title: "Doctor Command Center",
    subtitle: "doctor_command_center_16_9"
  },
  {
    href: "/patients",
    title: "Patient Intelligence Registration",
    subtitle: "patient_intelligence_registration_16_9"
  },
  {
    href: "/reports",
    title: "Diagnostic Intelligence Workspace",
    subtitle: "diagnostic_intelligence_workspace_16_9"
  },
  {
    href: "/analytics",
    title: "Executive Intelligence Dashboard",
    subtitle: "executive_intelligence_dashboard_16_9"
  },
  {
    href: "/ai-intelligence",
    title: "Clinical Research And Trial Matching",
    subtitle: "clinical_research_trial_matching_16_9"
  },
  {
    href: "/copilot",
    title: "Clinical AI Copilot",
    subtitle: "ai_clinical_copilot_16_9"
  },
  {
    href: "/billing",
    title: "Billing Revenue Intelligence",
    subtitle: "billing_revenue_intelligence_16_9"
  },
  {
    href: "/b2b/partners",
    title: "B2B Partner And Referral Portal",
    subtitle: "b2b_partner_referral_portal_16_9"
  },
  {
    href: "/lims",
    title: "Supply Chain And Pharmacy Intelligence",
    subtitle: "supply_chain_pharmacy_intelligence_16_9"
  },
  {
    href: "/workflow",
    title: "Workforce Intelligence Scheduling",
    subtitle: "workforce_intelligence_scheduling_16_9"
  },
  {
    href: "/ris",
    title: "Digital Patient Twin",
    subtitle: "digital_patient_twin_16_9"
  }
] as const;

export default function HomePage() {
  return (
    <AppShell activePath="/doctor/command-center" eyebrow="Figma rollout" title="Screen Hub">
      <section className="screen-hub-grid">
        {screenEntries.map((entry) => (
          <Link className="screen-hub-card" href={entry.href} key={entry.href}>
            <Image
              alt={entry.title}
              className="screen-hub-thumb"
              height={1080}
              src={`/figma-screens/${entry.subtitle}/screen.png`}
              width={1920}
            />
            <div className="screen-hub-meta">
              <span>{entry.subtitle}</span>
              <strong>{entry.title}</strong>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
