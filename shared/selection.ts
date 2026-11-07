export function toggleWithFloor<T extends string>(
  all: readonly T[],
  selected: readonly T[],
  id: T,
  emptyMeansAll: boolean,
): T[] {
  const current = new Set(emptyMeansAll && selected.length === 0 ? all : selected);
  if (current.has(id)) {
    if (current.size === 1) return emptyMeansAll && selected.length === 0 ? [] : [...current];
    current.delete(id);
  } else {
    current.add(id);
  }
  const next = all.filter((item) => current.has(item));
  if (emptyMeansAll && next.length === all.length) return [];
  return next;
}
