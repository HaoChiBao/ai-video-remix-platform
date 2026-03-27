"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGenerator } from "@/hooks/use-generator";
import type { Movie, Show } from "@/types";
import { cn } from "@/lib/utils";

const steps = [
  "Source",
  "Boundaries",
  "Prompt",
  "Preview",
  "Result",
  "Publish",
] as const;

export function CreateClient({ catalogTitles }: { catalogTitles: (Movie | Show)[] }) {
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const {
    session,
    next,
    back,
    selectContent,
    setSegment,
    setPromptText,
    setPublish,
    segmentDurationSeconds,
    segmentValidation,
    promptValidation,
    publishValidation,
    runGeneration,
    reset,
    limits,
  } = useGenerator();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const source = searchParams.get("source");
    if (source && catalogTitles.some((t) => t.id === source)) {
      selectContent(source);
    }
  }, [searchParams, selectContent, catalogTitles]);

  const filteredTitles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalogTitles;
    return catalogTitles.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }, [query, catalogTitles]);

  const selected = catalogTitles.find((t) => t.id === session.selectedContentId);

  const canNext = () => {
    switch (session.step) {
      case 1:
        return !!session.selectedContentId;
      case 2:
        return segmentValidation.ok;
      case 3:
        return promptValidation.ok;
      case 4:
        return true;
      case 5:
        return session.status === "success" || session.status === "failed";
      case 6:
        return publishValidation.ok;
      default:
        return false;
    }
  };

  const handlePrimary = () => {
    if (session.step === 4) {
      runGeneration();
      next();
      return;
    }
    if (session.step === 5) {
      if (session.status === "success") {
        next();
      }
      return;
    }
    if (session.step === 6) {
      toast.success("Published (demo) — clip metadata saved locally.");
      reset();
      return;
    }
    if (session.step < 6) next();
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6">
      <PageHeader
        title="Create segment"
        description="AI-assisted workflow for rights-cleared sources. Clips must stay between 15 seconds and 5 minutes."
      />

      <ol className="mb-10 flex flex-wrap gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = session.step === n;
          const done = session.step > n;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                active && "border-[var(--electric-aqua)] bg-white/10 text-white",
                done && !active && "border-white/20 text-[var(--aurora-glow)]",
                !done && !active && "border-white/10 text-[var(--muted-foreground)]",
              )}
            >
              <span className="tabular-nums">{n}</span>
              {label}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={session.step}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="rounded-sm border border-white/20 bg-card/50 p-6 shadow-xl backdrop-blur-sm"
        >
          {session.step === 1 && (
            <div className="space-y-4">
              <Label htmlFor="q-src">Search licensed titles</Label>
              <Input
                id="q-src"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="border-white/15 bg-white/5"
              />
              <div className="grid max-h-[360px] gap-3 overflow-y-auto sm:grid-cols-2">
                {filteredTitles.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectContent(t.id)}
                    className={cn(
                      "flex gap-3 rounded-sm border p-3 text-left transition hover:border-[var(--electric-aqua)]/50",
                      session.selectedContentId === t.id
                        ? "border-[var(--electric-aqua)] bg-white/10"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={t.posterUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">{t.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {t.year} · {t.genres.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {session.step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Mock timeline: drag handles are simulated with numeric inputs. Duration must be{" "}
                {limits.minSeconds}–{limits.maxSeconds}s.
              </p>
              <div className="rounded-sm border border-white/10 bg-black/40 p-4">
                <div className="relative h-3 w-full rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0047AB] to-[#00FFFF]"
                    style={{
                      width: `${Math.min(100, (segmentDurationSeconds / limits.maxSeconds) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="start">Start (seconds)</Label>
                    <Input
                      id="start"
                      type="number"
                      min={0}
                      value={session.segmentStartSeconds}
                      onChange={(e) =>
                        setSegment(Number(e.target.value), session.segmentEndSeconds)
                      }
                      className="mt-1 border-white/15 bg-white/5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">End (seconds)</Label>
                    <Input
                      id="end"
                      type="number"
                      min={0}
                      value={session.segmentEndSeconds}
                      onChange={(e) =>
                        setSegment(session.segmentStartSeconds, Number(e.target.value))
                      }
                      className="mt-1 border-white/15 bg-white/5"
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-white">
                Duration: <strong>{segmentDurationSeconds}s</strong>
              </p>
              {!segmentValidation.ok && (
                <p className="text-sm text-destructive">{segmentValidation.error}</p>
              )}
            </div>
          )}

          {session.step === 3 && (
            <div className="space-y-4">
              <Label htmlFor="prompt">Describe the clip</Label>
              <Textarea
                id="prompt"
                value={session.prompt.text}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="What should the highlight emphasize? Mood, pacing, dialogue beats…"
                className="min-h-[160px] border-white/15 bg-white/5"
              />
              {!promptValidation.ok && (
                <p className="text-sm text-destructive">{promptValidation.error}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Model / style</Label>
                  <Select value="soon" disabled>
                    <SelectTrigger className="mt-1 border-white/15 bg-white/5">
                      <SelectValue placeholder="Coming soon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soon">Coming soon</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Advanced model routing — coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {session.step === 4 && (
            <div className="space-y-4 text-sm text-[var(--muted-foreground)]">
              <h3 className="font-heading text-lg text-white">Preview settings</h3>
              <div className="rounded-sm border border-white/10 bg-white/5 p-4">
                <p>
                  <span className="text-white">Source:</span> {selected?.title ?? "—"}
                </p>
                <p className="mt-2">
                  <span className="text-white">Segment:</span>{" "}
                  {session.segmentStartSeconds}s → {session.segmentEndSeconds}s ({segmentDurationSeconds}
                  s)
                </p>
                <p className="mt-2">
                  <span className="text-white">Prompt:</span> {session.prompt.text || "—"}
                </p>
              </div>
              <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
                <strong className="text-white">Moderation</strong>: Clips must comply with
                community guidelines. No unlawful or unlicensed material.
              </div>
            </div>
          )}

          {session.step === 5 && (
            <div className="space-y-4">
              {session.status === "idle" || session.status === "generating" ? (
                <p className="text-[var(--muted-foreground)]">
                  {session.status === "generating"
                    ? "Generating… (simulated)"
                    : "Ready to generate."}
                </p>
              ) : null}
              {session.status === "generating" && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full w-1/3 bg-gradient-to-r from-[#0047AB] to-[#00FFFF]"
                    animate={{ x: ["0%", "200%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  />
                </div>
              )}
              {session.status === "failed" && (
                <p className="text-destructive">{session.errorMessage}</p>
              )}
              {session.status === "success" && (
                <div className="rounded-sm border border-[var(--electric-aqua)]/40 bg-black/30 p-4">
                  <p className="font-medium text-white">Preview ready</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Simulated clip ID: {session.generatedClipId}
                  </p>
                </div>
              )}
            </div>
          )}

          {session.step === 6 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pub-title">Clip title</Label>
                <Input
                  id="pub-title"
                  value={session.publishTitle}
                  onChange={(e) =>
                    setPublish(e.target.value, session.publishDescription)
                  }
                  className="mt-1 border-white/15 bg-white/5"
                  placeholder="Give your clip a clear title"
                />
              </div>
              <div>
                <Label htmlFor="pub-desc">Description</Label>
                <Textarea
                  id="pub-desc"
                  value={session.publishDescription}
                  onChange={(e) =>
                    setPublish(session.publishTitle, e.target.value)
                  }
                  className="mt-1 min-h-[120px] border-white/15 bg-white/5"
                />
              </div>
              {!publishValidation.ok && (
                <p className="text-sm text-destructive">{publishValidation.error}</p>
              )}
              <Separator className="bg-white/10" />
              <p className="text-xs text-[var(--muted-foreground)]">
                Publishing attaches the <strong className="text-[var(--electric-aqua)]">AI-Generated</strong>{" "}
                label when your workflow uses assisted generation. Be accurate so viewers can trust
                the signal.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={session.step === 1}
        >
          Back
        </Button>
        <div className="flex gap-3">
          {session.step === 5 && session.status === "failed" && (
            <Button type="button" variant="secondary" onClick={() => runGeneration()}>
              Retry
            </Button>
          )}
          <Button
            type="button"
            className="bg-gradient-to-r from-[#0047AB] to-[#4169E1] text-white"
            disabled={
              !canNext() ||
              (session.step === 5 &&
                (session.status === "generating" || session.status !== "success"))
            }
            onClick={handlePrimary}
          >
            {session.step === 4
              ? "Generate"
              : session.step === 5
                ? session.status === "generating"
                  ? "Generating…"
                  : "Continue"
                : session.step === 6
                  ? "Publish"
                  : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
