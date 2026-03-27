import { MainNav } from "@/components/navigation/main-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="relative flex-1">{children}</main>
      <footer className="border-t border-white/10 bg-[#001848]/90 py-8 text-center text-xs text-[var(--muted-foreground)]">
        <p>
          Prototype UI — content shown is fictional or rights-cleared for demonstration.
        </p>
      </footer>
    </div>
  );
}
