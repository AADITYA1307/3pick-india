import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data");
const file = path.join(dir, "shortlists.json");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function saveShortlist(record) {
  const all = readAll();
  all[record.id] = record;
  writeAll(all);
  return record;
}

export function getShortlist(id) {
  return readAll()[id] || null;
}

export function updateShortlistContact(id, contact) {
  const all = readAll();
  const record = all[id];
  if (!record) return null;
  record.contact = {
    name: contact.name.trim(),
    mobile: contact.mobile,
    updatedAt: new Date().toISOString(),
  };
  all[id] = record;
  writeAll(all);
  return record;
}

export function saveTestDriveBooking(id, booking) {
  const all = readAll();
  const record = all[id];
  if (!record) return null;
  if (!Array.isArray(record.testDrives)) record.testDrives = [];

  const entry = {
    carId: booking.carId,
    carName: booking.carName,
    name: booking.name,
    mobile: booking.mobile,
    date: booking.date,
    slot: booking.slot,
    slotLabel: booking.slotLabel,
    updatedAt: new Date().toISOString(),
  };

  const idx = record.testDrives.findIndex((t) => t.carId === booking.carId);
  if (idx >= 0) record.testDrives[idx] = entry;
  else record.testDrives.push(entry);

  all[id] = record;
  writeAll(all);
  return entry;
}

export function getTestDriveBooking(id, carId) {
  const record = getShortlist(id);
  if (!record?.testDrives) return null;
  return record.testDrives.find((t) => t.carId === carId) || null;
}
