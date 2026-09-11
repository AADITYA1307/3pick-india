import { readAllRecords, writeAllRecords } from "./persistence.js";

export async function saveShortlist(record) {
  const all = await readAllRecords();
  all[record.id] = record;
  await writeAllRecords(all);
  return record;
}

export async function getShortlist(id) {
  const all = await readAllRecords();
  return all[id] || null;
}

export async function updateShortlistContact(id, contact) {
  const all = await readAllRecords();
  const record = all[id];
  if (!record) return null;
  record.contact = {
    name: contact.name.trim(),
    mobile: contact.mobile,
    updatedAt: new Date().toISOString(),
  };
  all[id] = record;
  await writeAllRecords(all);
  return record;
}

export async function saveTestDriveBooking(id, booking) {
  const all = await readAllRecords();
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
  await writeAllRecords(all);
  return entry;
}

export async function getTestDriveBooking(id, carId) {
  const record = await getShortlist(id);
  if (!record?.testDrives) return null;
  return record.testDrives.find((t) => t.carId === carId) || null;
}
