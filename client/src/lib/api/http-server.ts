import { apiGet } from "./http";

/** Use from Server Components only — enables ISR-style caching. */
export async function apiGetCached<T>(path: string, revalidateSeconds = 120): Promise<T> {
  return apiGet<T>(path, {
    next: { revalidate: revalidateSeconds },
  });
}
