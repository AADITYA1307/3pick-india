import { redirect } from "next/navigation";
import { getShortlist } from "../../../lib/store.js";

export const dynamic = "force-dynamic";

export default async function ShortlistPage({ params }) {
  const record = await getShortlist(params.id);
  if (!record) redirect("/");
  redirect(`/m/${params.id}`);
}
