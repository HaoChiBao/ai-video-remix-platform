"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

/** Top nav / toolbar: local draft + navigate on submit */
export function useSearchNavigation(initial?: string) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial ?? "");

  const go = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    },
    [router],
  );

  return { draft, setDraft, go };
}
