export function normalizeMobile(raw) {
  return String(raw || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(0, 10);
}

export function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function isValidName(name) {
  return String(name || "").trim().length >= 2;
}

export function validateContact({ name, mobile }) {
  const trimmedName = String(name || "").trim();
  const digits = normalizeMobile(mobile);
  if (!isValidName(trimmedName)) return "Enter your name (at least 2 characters).";
  if (digits.length !== 10) return "Enter a 10-digit mobile number (no +91).";
  if (!isValidMobile(digits)) return "Mobile must be 10 digits starting with 6–9.";
  return null;
}
