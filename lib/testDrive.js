import { validateContact, normalizeMobile } from "./contact.js";

export const TEST_DRIVE_SLOTS = [
  { value: "10:00", label: "10:00 AM – 11:00 AM" },
  { value: "11:00", label: "11:00 AM – 12:00 PM" },
  { value: "12:00", label: "12:00 PM – 1:00 PM" },
  { value: "13:00", label: "1:00 PM – 2:00 PM" },
  { value: "14:00", label: "2:00 PM – 3:00 PM" },
  { value: "15:00", label: "3:00 PM – 4:00 PM" },
  { value: "16:00", label: "4:00 PM – 5:00 PM" },
  { value: "17:00", label: "5:00 PM – 6:00 PM" },
];

export function slotLabel(value) {
  return TEST_DRIVE_SLOTS.find((s) => s.value === value)?.label || value;
}

export function minBookingDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidBookingDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return date >= minBookingDate();
}

export function validateTestDriveBooking({ name, mobile, date, slot }) {
  const contactError = validateContact({ name, mobile });
  if (contactError) return contactError;
  if (!date) return "Pick a date for your test drive.";
  if (!isValidBookingDate(date)) return "Choose today or a future date.";
  if (!slot || !TEST_DRIVE_SLOTS.some((s) => s.value === slot)) return "Pick a one-hour slot (10 AM – 6 PM).";
  return null;
}

export function normalizeTestDriveBooking(body) {
  return {
    carId: String(body?.carId || "").trim(),
    carName: String(body?.carName || "").trim(),
    name: String(body?.name || "").trim(),
    mobile: normalizeMobile(body?.mobile),
    date: String(body?.date || "").trim(),
    slot: String(body?.slot || "").trim(),
  };
}
