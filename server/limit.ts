const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const MAX_BUCKETS = 5_000;

const buckets = new Map<string, { count: number; reset: number }>();

export function allowSearch(caller: string, now = Date.now()): boolean {
  const current = buckets.get(caller);
  if (!current || current.reset <= now) {
    if (!current && buckets.size >= MAX_BUCKETS) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    buckets.set(caller, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export function clearSearchLimits(): void {
  buckets.clear();
}
