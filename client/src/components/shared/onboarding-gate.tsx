"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { genreOptions } from "@/lib/data/filters";

const KEY = "cobalt-stream-onboarding";

export function OnboardingGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (typeof window !== "undefined" && !window.localStorage.getItem(KEY)) {
          setOpen(true);
        }
      } catch {
        setOpen(true);
      }
    });
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="max-w-lg border-white/10 bg-[#0a2760] text-left sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-white">
            Welcome to {siteConfig.name}
          </DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)]">
            {siteConfig.tagline} Browse licensed and original titles, join the community with
            clips, and use AI-assisted tools to highlight moments—always labeled when AI is
            involved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            <span className="font-medium text-white">Community clips</span> are short segments
            shared by creators. Clips marked{" "}
            <span className="text-[var(--electric-aqua)]">AI-Generated</span> use our assisted
            workflow; all sources must be rights-cleared.
          </p>
          <div>
            <Label className="text-white">Popular genres to explore</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {genreOptions.slice(0, 8).map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--aurora-glow)]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Link
            href="/onboarding"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-[var(--muted-foreground)]",
            )}
          >
            Full intro
          </Link>
          <Button
            className="bg-gradient-to-r from-[#0047AB] to-[#4169E1] text-white hover:opacity-95"
            onClick={dismiss}
          >
            Get started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
