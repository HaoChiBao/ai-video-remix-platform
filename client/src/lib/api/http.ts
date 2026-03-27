import { getApiBaseUrl } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type NextFetchInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

function resolveApiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Low-level fetch to the backend. Prefer {@link apiGet} for JSON GET; use this for non-JSON or custom methods.
 * Always uses {@link getApiBaseUrl} from env (`NEXT_PUBLIC_API_URL` / `API_URL`).
 */
export async function apiFetch(path: string, init?: NextFetchInit): Promise<Response> {
  const url = resolveApiUrl(path);
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}

export async function apiGet<T>(path: string, init?: NextFetchInit): Promise<T> {
  const res = await apiFetch(path, init);

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new ApiError(`API ${res.status}: ${path}`, res.status, data);
  }

  return data as T;
}
