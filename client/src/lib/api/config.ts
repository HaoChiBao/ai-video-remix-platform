/**
 * Express / backend API base URL.
 *
 * **Edit these in `.env` / `.env.local` (never commit secrets):**
 *
 * | Variable | Where it applies |
 * |----------|------------------|
 * | `NEXT_PUBLIC_API_URL` | **Browser** (client components) and fallback for the Next.js server. Must be a full origin (no trailing slash). Inlined at **build time** — redeploy after changing. |
 * | `API_URL` | **Next.js server only** (Server Components, `generateMetadata`, etc.). Use when the server should call a different host than the browser (e.g. Docker service name `http://api:8080` vs public `https://api.example.com`). If unset, `NEXT_PUBLIC_API_URL` is used. |
 *
 * All JSON API traffic (`/api/home`, `/api/details/...`, search, episodes, etc.) goes through
 * {@link getApiBaseUrl} → `apiFetch` / `apiGet` in `http.ts`.
 */

const DEFAULT_API_BASE = "http://127.0.0.1:8080";

function normalizeApiBase(raw: string | undefined): string {
  if (raw == null || raw.trim() === "") {
    return DEFAULT_API_BASE;
  }
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Base URL for backend API requests (no trailing slash).
 * This is the single source of truth for resolving relative paths like `/api/home`.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  }
  return normalizeApiBase(process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL);
}
