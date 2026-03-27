import { MainNav } from "@/components/navigation/main-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <MainNav />
      <main className="relative z-10 flex-1">{children}</main>
      <footer className="relative z-10 border-t border-white/20 bg-black py-8 text-center text-xs text-[var(--muted-foreground)]">
        <p>
          Prototype UI — content shown is fictional or rights-cleared for demonstration.
        </p>
      </footer>
    </div>
  );
}
