export const runtime = "nodejs";

import { getShortlist } from "../../../../lib/store.js";

export async function GET(_req, { params }) {
  const record = await getShortlist(params.id);
  if (!record) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(record);
}
