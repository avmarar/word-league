import Link from "next/link";

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

const links = [
  { href: "/", label: "Home", key: "home" as const },
  { href: "/play", label: "Daily", key: "play" as const },
  { href: "/practice", label: "Practice", key: "practice" as const },
  { href: "/leaderboard", label: "Leaderboard", key: "leaderboard" as const },
  { href: "/stats", label: "Stats", key: "stats" as const },
  { href: "/how-to-play", label: "How to play", key: "how-to-play" as const },
];

export function AppShell({ children, active }: AppShellProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#030614] via-[#060b1f] to-[#010103] px-4 py-6 text-white">
      <header className="mx-auto mb-8 flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Word League
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
                active === link.key
                  ? "bg-cyan-400/20 text-cyan-200"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl">{children}</main>
    </div>
  );
}
