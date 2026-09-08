const DRAFT_KEY = "3pick-india-interview-draft";

export function saveDraft({ name, mobile, city, step, answers }) {
  if (typeof window === "undefined") return;
  const draft = {
    version: 1,
    savedAt: new Date().toISOString(),
    name: name.trim(),
    mobile,
    city,
    step,
    answers,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft?.city || !draft?.answers) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}
