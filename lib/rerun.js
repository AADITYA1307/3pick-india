const RERUN_KEY = "3pick-india-interview-rerun";

function storage() {
  if (typeof globalThis.localStorage === "undefined") return null;
  return globalThis.localStorage;
}

export function saveRerunSeed(answers) {
  const ls = storage();
  if (!ls) return;
  const seed = {
    version: 1,
    savedAt: new Date().toISOString(),
    answers,
  };
  ls.setItem(RERUN_KEY, JSON.stringify(seed));
  return seed;
}

export function loadRerunSeed() {
  const ls = storage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(RERUN_KEY);
    if (!raw) return null;
    const seed = JSON.parse(raw);
    if (!seed?.answers?.city) return null;
    return seed;
  } catch {
    return null;
  }
}

export function clearRerunSeed() {
  const ls = storage();
  if (!ls) return;
  ls.removeItem(RERUN_KEY);
}
