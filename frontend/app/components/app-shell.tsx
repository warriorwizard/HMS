import Link from "next/link";
import type { ReactNode } from "react";

import { navItems } from "@/app/lib/workspace-data";

type AppShellProps = {
  activePath: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  rightSlot?: ReactNode;
};

export function AppShell({
  activePath,
  eyebrow,
  title,
  children,
  rightSlot
}: AppShellProps) {
  return (
    <main className="workspace">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Tarini V6</p>
          <h1>Clinical Operations</h1>
        </div>
        <nav aria-label="Primary navigation" className="primary-nav">
          {navItems.map((item) => {
            const isActive = activePath === item.href;

            return (
              <Link className={isActive ? "active" : ""} href={item.href} key={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

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
