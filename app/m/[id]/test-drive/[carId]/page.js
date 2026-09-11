import { notFound } from "next/navigation";
import TestDriveBookingClient from "../../../../TestDriveBookingClient";
import { getTestDriveBooking, getShortlist } from "../../../../../lib/store.js";
import { buildMemo, scoreCatalog } from "../../../../../lib/score.js";

export const dynamic = "force-dynamic";

export default async function TestDrivePage({ params }) {
  const record = await getShortlist(params.id);
  if (!record) notFound();

  const result = scoreCatalog(record.answers);
  const memo = buildMemo(record.answers, result);
  const pick = memo.picks.find((p) => p.carId === params.carId);
  if (!pick) notFound();

  const existingBooking = await getTestDriveBooking(params.id, params.carId);

  return (
    <TestDriveBookingClient
      memoId={params.id}
      pick={pick}
      initialContact={record.contact}
      existingBooking={existingBooking}
    />
  );
}
