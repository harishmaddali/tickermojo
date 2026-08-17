import Link from "next/link";

const nav = [
  { href: "/", label: "All companies" },
  { href: "/nse", label: "NSE" },
  { href: "/bse", label: "BSE" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--header)] text-[var(--header-foreground)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 tracking-tight">
          <span className="text-lg font-semibold">TickerMojo</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-[var(--header-muted)] sm:inline">
            Indian equities
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[var(--header-muted)] transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
