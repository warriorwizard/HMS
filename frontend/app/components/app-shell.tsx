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
          <div>
            <p className="eyebrow">Tarini V6</p>
            <h1>Clinical Operations</h1>
          </div>
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
          {rightSlot ?? <div className="tenant-chip">Apollo Demo Center</div>}
        </header>
        {children}
      </section>
    </main>
  );
}
