import type { ReactNode } from "react";

import { SidebarNav } from "@/app/components/sidebar-nav";
import { filterNavByPermissions } from "@/app/lib/permissions";
import { navItems } from "@/app/lib/workspace-data";

type AppShellProps = {
  activePath: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  hideSidebar?: boolean;
  /** Permission keys for the current user. When omitted, all nav items are shown. */
  permissions?: readonly string[];
};

export function AppShell({
  activePath,
  eyebrow,
  title,
  children,
  rightSlot,
  hideSidebar = false,
  permissions,
}: AppShellProps) {
  const visibleNav = permissions ? filterNavByPermissions(navItems, permissions) : navItems;

  return (
    <main className={hideSidebar ? "workspace workspace-no-sidebar" : "workspace"}>
      {hideSidebar ? null : (
        <aside className="sidebar">
          <div className="brand-lockup">
            <span className="proxomind-mark" aria-hidden="true">
              <svg viewBox="0 0 72 72" role="img">
                <path d="M18 18 46 36 18 54" />
                <circle cx="18" cy="18" r="10" />
                <circle cx="50" cy="36" r="10" />
                <circle cx="18" cy="54" r="10" />
              </svg>
            </span>
            <div className="brand-wordmark" aria-label="ProxoMind Labs">
              <strong><span>Proxo</span><em>Mind</em></strong>
              <small>LABS</small>
            </div>
          </div>
          <div className="product-chip">ProxoHMS</div>
          <SidebarNav activePath={activePath} items={visibleNav} />
          <details className="mobile-nav" role="navigation">
            <summary>Open Navigation</summary>
            <SidebarNav activePath={activePath} items={visibleNav} variant="mobile" />
          </details>
        </aside>
      )}

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          {rightSlot ?? <div className="tenant-chip">ProxoHMS Care Center</div>}
        </header>
        {children}
      </section>
    </main>
  );
}
