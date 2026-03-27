"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Menu, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    const url = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    router.push(url);
  };

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-white/10 text-white"
        : "text-[var(--muted-foreground)] hover:bg-white/5 hover:text-white",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#002060]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-white shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={onSearch}
          className="ml-auto flex flex-1 max-w-md items-center gap-2"
          role="search"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, genres…"
              className="h-10 border-white/15 bg-white/5 pl-10 text-white placeholder:text-[var(--muted-foreground)]"
              aria-label="Search"
            />
          </div>
          <Button type="submit" size="sm" className="hidden sm:inline-flex shrink-0">
            Search
          </Button>
        </form>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-white/10 bg-[#061a4a] text-white w-[min(100%,320px)]"
          >
            <SheetHeader>
              <SheetTitle className="text-left font-heading">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
