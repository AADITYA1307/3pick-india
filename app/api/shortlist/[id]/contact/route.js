export const runtime = "nodejs";

import { validateContact, normalizeMobile } from "../../../../../lib/contact.js";
import { getShortlist, updateShortlistContact } from "../../../../../lib/store.js";

export async function PATCH(req, { params }) {
  const record = getShortlist(params.id);
  if (!record) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const name = body?.name;
  const mobile = normalizeMobile(body?.mobile);
  const error = validateContact({ name, mobile });
  if (error) return Response.json({ error }, { status: 400 });

  const updated = updateShortlistContact(params.id, { name, mobile });
  return Response.json({ contact: updated.contact });
}
