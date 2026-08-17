import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        That company or page is not in TickerMojo.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm underline decoration-[var(--line)] underline-offset-4"
      >
        Back to all companies
      </Link>
    </div>
  );
}
