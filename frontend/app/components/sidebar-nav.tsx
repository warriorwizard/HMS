"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { NavItem } from "@/app/lib/workspace-data";

const SIDEBAR_SCROLL_KEY = "proxohms.sidebar.scrollTop";

type SidebarNavProps = {
  activePath: string;
  items: readonly NavItem[];
  variant?: "desktop" | "mobile";
};

export function SidebarNav({ activePath, items, variant = "desktop" }: SidebarNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const currentPath = pathname || activePath;
  const remembersScroll = variant === "desktop";

  useEffect(() => {
    if (!remembersScroll) {
      return;
    }

    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const savedScrollTop = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY));
    if (Number.isFinite(savedScrollTop) && savedScrollTop > 0) {
      requestAnimationFrame(() => {
        nav.scrollTop = savedScrollTop;
      });
      return;
    }

    nav.querySelector<HTMLAnchorElement>("a.active")?.scrollIntoView({
      block: "nearest"
    });
  }, [currentPath, remembersScroll]);

  function rememberScrollPosition() {
    if (!remembersScroll || !navRef.current) {
      return;
    }

    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(navRef.current.scrollTop));
  }

  return (
    <nav
      aria-label={variant === "desktop" ? "Primary navigation" : "Mobile navigation"}
      className={variant === "desktop" ? "primary-nav desktop-nav" : "primary-nav mobile-nav-links"}
      onScroll={rememberScrollPosition}
      ref={navRef}
    >
      {items.map((item) => {
        const isActive = currentPath === item.href || activePath === item.href;

        return (
          <Link
            className={isActive ? "active" : ""}
            href={item.href}
            key={`${variant}-${item.href}`}
            onClick={rememberScrollPosition}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
