import Link from "next/link";
import {
  BarChart3,
  CircleHelp,
  Home,
  Repeat2,
  Swords,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  active?:
    | "home"
    | "play"
    | "practice"
    | "leaderboard"
    | "stats"
    | "how-to-play";
};

const primaryLinks = [
  { href: "/", label: "Home", key: "home" as const, icon: Home },
  { href: "/play", label: "Daily", key: "play" as const, icon: Swords },
  { href: "/practice", label: "Practice", key: "practice" as const, icon: Repeat2 },
  { href: "/leaderboard", label: "Leaderboard", key: "leaderboard" as const, icon: Trophy },
];

const secondaryLinks = [
  { href: "/stats", label: "Stats", key: "stats" as const, icon: BarChart3 },
  { href: "/how-to-play", label: "How to play", key: "how-to-play" as const, icon: CircleHelp },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  variant = "horizontal",
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  variant?: "horizontal" | "compact" | "sidebar";
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex font-medium transition-all hover:bg-accent/60",
        variant === "horizontal" &&
          "items-center gap-2 rounded-full px-3 py-2 text-sm lg:px-4",
        variant === "compact" &&
          "flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.65rem]",
        variant === "sidebar" &&
          "w-full flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[0.6rem] leading-tight",
        active ? "nav-pill-active" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          variant === "compact" || variant === "sidebar" ? "size-5" : "size-4"
        )}
      />
      <span className="text-center">{label}</span>
    </Link>
  );
}

const sidebarContentPl = "md:pl-[calc(5.75rem+1.25rem)]";

export function AppShell({ children, active }: AppShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Tablet sidebar: md–lg */}
      <aside
        aria-label="Main"
        className="fixed inset-y-0 left-0 z-40 hidden w-[5.75rem] flex-col border-r border-border/60 bg-background/95 py-5 backdrop-blur-md md:flex lg:hidden"
      >
        <Link
          href="/"
          className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary transition hover:bg-primary/25"
          title="Word League"
        >
          WL
        </Link>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
          {allLinks.map((link) => (
            <NavLink
              key={link.key}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={active === link.key}
              variant="sidebar"
            />
          ))}
        </nav>
      </aside>

      {/* Desktop header: lg+ */}
      <header className="mx-auto mb-8 hidden w-full max-w-5xl flex-col gap-4 px-4 pt-6 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="font-display text-xl font-semibold tracking-tight transition group-hover:text-primary">
            Word League
          </span>
          <span className="text-xs text-muted-foreground">
            Daily words, office bragging rights
          </span>
        </Link>

        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          {allLinks.map((link) => (
            <NavLink
              key={link.key}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={active === link.key}
              variant="horizontal"
            />
          ))}
        </nav>
      </header>

      {/* Mobile + tablet brand bar (tablet shows compact title beside sidebar) */}
      <div className={cn("border-b border-border/40 px-4 py-4 lg:hidden", sidebarContentPl)}>
        <Link href="/" className="group flex flex-col">
          <span className="font-display text-lg font-semibold tracking-tight transition group-hover:text-primary">
            Word League
          </span>
          <span className="text-xs text-muted-foreground md:hidden">
            Daily words, office bragging rights
          </span>
        </Link>
      </div>

      <main
        id="main-content"
        className={cn(
          "mx-auto w-full max-w-5xl px-4 pb-28 pt-6",
          sidebarContentPl,
          "md:pb-6",
          "lg:px-4 lg:pb-6 lg:pl-4 lg:pt-6"
        )}
      >
        {children}
      </main>

      {/* Mobile bottom nav: < md */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 px-2 py-2 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.key}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={active === link.key}
              variant="compact"
            />
          ))}
        </div>
        <div className="mx-auto mt-1 flex max-w-lg justify-center gap-4">
          {secondaryLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
              className={cn(
                "text-xs text-muted-foreground transition hover:text-foreground",
                active === link.key && "font-semibold text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
