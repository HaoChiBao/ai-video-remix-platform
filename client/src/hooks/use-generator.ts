"use client";

import { useCallback, useMemo, useState } from "react";
import type { GeneratorSession, GeneratorStatus, GeneratorStep } from "@/types";
import { siteConfig } from "@/config/site";
import { promptSchema, publishSchema, segmentSchema } from "@/lib/validations/create-clip";

const initialSession = (): GeneratorSession => ({
  step: 1,
  selectedContentId: null,
  segmentStartSeconds: 0,
  segmentEndSeconds: 60,
  prompt: { text: "" },
  previewModelId: null,
  status: "idle",
  errorMessage: null,
  publishTitle: "",
  publishDescription: "",
  generatedClipId: null,
});

export function useGenerator() {
  const [session, setSession] = useState<GeneratorSession>(initialSession);

  const setStep = useCallback((step: GeneratorStep) => {
    setSession((s) => ({ ...s, step }));
  }, []);

  const next = useCallback(() => {
    setSession((s) => {
      const nextStep = Math.min(6, s.step + 1) as GeneratorStep;
      return { ...s, step: nextStep };
    });
  }, []);

  const back = useCallback(() => {
    setSession((s) => {
      const prevStep = Math.max(1, s.step - 1) as GeneratorStep;
      return { ...s, step: prevStep };
    });
  }, []);

  const selectContent = useCallback((id: string | null) => {
    setSession((s) => ({ ...s, selectedContentId: id }));
  }, []);

  const setSegment = useCallback((start: number, end: number) => {
    setSession((s) => ({ ...s, segmentStartSeconds: start, segmentEndSeconds: end }));
  }, []);

  const setPromptText = useCallback((text: string) => {
    setSession((s) => ({ ...s, prompt: { ...s.prompt, text } }));
  }, []);

  const setPublish = useCallback((title: string, description: string) => {
    setSession((s) => ({ ...s, publishTitle: title, publishDescription: description }));
  }, []);

  const reset = useCallback(() => {
    setSession(initialSession());
  }, []);

  const segmentDurationSeconds = useMemo(
    () => Math.max(0, session.segmentEndSeconds - session.segmentStartSeconds),
    [session.segmentEndSeconds, session.segmentStartSeconds],
  );

  const segmentValidation = useMemo(() => {
    const r = segmentSchema.safeParse({
      start: session.segmentStartSeconds,
      end: session.segmentEndSeconds,
    });
    return r.success
      ? { ok: true as const }
      : { ok: false as const, error: r.error.issues[0]?.message ?? "Invalid segment" };
  }, [session.segmentEndSeconds, session.segmentStartSeconds]);

  const promptValidation = useMemo(() => {
    const r = promptSchema.safeParse({ text: session.prompt.text });
    return r.success
      ? { ok: true as const }
      : { ok: false as const, error: r.error.issues[0]?.message ?? "Invalid prompt" };
  }, [session.prompt.text]);

  const publishValidation = useMemo(() => {
    const r = publishSchema.safeParse({
      title: session.publishTitle,
      description: session.publishDescription,
    });
    return r.success
      ? { ok: true as const }
      : { ok: false as const, error: r.error.issues[0]?.message ?? "Invalid publish fields" };
  }, [session.publishDescription, session.publishTitle]);

  const runGeneration = useCallback(() => {
    setSession((s) => ({ ...s, status: "generating" as GeneratorStatus, errorMessage: null }));
    window.setTimeout(() => {
      const fail = Math.random() < 0.08;
      setSession((s) =>
        fail
          ? {
              ...s,
              status: "failed" as GeneratorStatus,
              errorMessage: "Simulated render error — try again.",
            }
          : {
              ...s,
              status: "success" as GeneratorStatus,
              generatedClipId: `gen-${Date.now()}`,
            },
      );
    }, 2200);
  }, []);

  const setStatus = useCallback((status: GeneratorStatus, errorMessage?: string | null) => {
    setSession((s) => ({ ...s, status, errorMessage: errorMessage ?? null }));
  }, []);

  return {
    session,
    setSession,
    setStep,
    next,
    back,
    selectContent,
    setSegment,
    setPromptText,
    setPublish,
    reset,
    segmentDurationSeconds,
    segmentValidation,
    promptValidation,
    publishValidation,
    runGeneration,
    setStatus,
    limits: siteConfig.clipDuration,
  };
}
