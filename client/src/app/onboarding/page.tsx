import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { genreOptions } from "@/lib/data/filters";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <PageHeader
        title={`Welcome to ${siteConfig.name}`}
        description="Short orientation for browsing, community clips, and AI-assisted creation."
      />
      <ol className="list-decimal space-y-6 pl-5 text-[var(--muted-foreground)]">
        <li>
          <strong className="text-white">Browse & watch</strong> — every title in this prototype is
          presented as licensed or original for demonstration.
        </li>
        <li>
          <strong className="text-white">Community clips</strong> — short highlights appear on
          title pages. Look for the AI-Generated badge when assisted workflows are used.
        </li>
        <li>
          <strong className="text-white">Create</strong> — the multi-step flow helps you pick
          source, segment length (15s–5min), and prompt. Publishing is simulated.
        </li>
      </ol>
      <div className="mt-8">
        <p className="text-sm font-medium text-white">Suggested genres</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {genreOptions.slice(0, 12).map((g) => (
            <span
              key={g}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--aurora-glow)]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
      <Link
        href="/browse"
        className="mt-10 inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-gradient-to-r from-[#0047AB] to-[#4169E1] px-4 text-sm font-medium text-white transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Start browsing
      </Link>
    </div>
  );
}
