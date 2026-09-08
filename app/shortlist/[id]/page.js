import { redirect } from "next/navigation";
import { getShortlist } from "../../../lib/store.js";

export const dynamic = "force-dynamic";

export default function ShortlistPage({ params }) {
  const record = getShortlist(params.id);
  if (!record) redirect("/");
  redirect(`/m/${params.id}`);
}
