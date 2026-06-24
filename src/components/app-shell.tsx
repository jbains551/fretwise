"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  Target,
  Guitar,
  LineChart,
  Moon,
  Sun,
  Flame,
  Timer,
} from "lucide-react";
import { LogIn } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand";
import { useTheme } from "@/components/theme-provider";
import { useStreak, useEnsureHydrated } from "@/lib/store";
import { useCloudSync } from "@/hooks/use-cloud-sync";

const NAV = [
  { href: "/", label: "Today", icon: Home },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: Target },
  { href: "/fretboard", label: "Fretboard", icon: Guitar },
  { href: "/tracker", label: "Tracker", icon: LineChart },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text transition-colors"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AccountButton({ compact = false }: { compact?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  // Avoid a flash before Clerk resolves the session.
  if (!isLoaded) return <span className={compact ? "h-10 w-10" : "h-10 w-full"} aria-hidden />;

  if (isSignedIn) {
    return (
      <div className={cn("flex items-center", compact ? "" : "gap-2 px-1")}>
        <UserButton />
        {!compact && <span className="text-sm text-muted">Synced</span>}
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 font-medium text-text transition-colors hover:bg-surface-3",
          compact ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5 text-sm",
        )}
        aria-label="Sign in to sync"
      >
        <LogIn size={compact ? 18 : 16} />
        {!compact && "Sign in to sync"}
      </button>
    </SignInButton>
  );
}

function StreakChip() {
  const streak = useStreak();
  return (
    <Link
      href="/tracker"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold"
      title={`${streak}-day practice streak`}
    >
      <Flame size={15} className={cn(streak > 0 ? "text-ember" : "text-muted")} />
      <span className="tabular">{streak}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEnsureHydrated();
  useCloudSync();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border px-4 py-6 md:flex">
        <div className="px-2 pb-6">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon size={19} className={cn(active && "text-accent")} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/metronome"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(pathname, "/metronome")
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <Timer size={19} />
            Metronome
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <StreakChip />
          </div>
          <AccountButton />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md md:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <StreakChip />
            <ThemeToggle />
            <AccountButton compact />
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon size={21} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
