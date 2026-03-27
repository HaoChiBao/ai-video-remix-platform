import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <p className="font-heading text-6xl font-bold text-white">404</p>
      <h1 className="text-xl text-[var(--muted-foreground)]">This page is not in the catalog.</h1>
      <Link
        href="/"
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back home
      </Link>
    </div>
  );
}
