export const runtime = "nodejs";

import { normalizeTestDriveBooking, slotLabel, validateTestDriveBooking } from "../../../../../lib/testDrive.js";
import { getShortlist, saveTestDriveBooking } from "../../../../../lib/store.js";

export async function POST(req, { params }) {
  const record = await getShortlist(params.id);
  if (!record) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const booking = normalizeTestDriveBooking(body);
  const error = validateTestDriveBooking(booking);
  if (error) return Response.json({ error }, { status: 400 });
  if (!booking.carId || !booking.carName) return Response.json({ error: "Missing car details." }, { status: 400 });

  const saved = await saveTestDriveBooking(params.id, {
    ...booking,
    slotLabel: slotLabel(booking.slot),
  });

  return Response.json({ booking: saved });
}
