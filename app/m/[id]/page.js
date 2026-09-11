import { notFound } from "next/navigation";
import MemoClient from "../../MemoClient";
import { getShortlist } from "../../../lib/store.js";

export const dynamic = "force-dynamic";

export default async function MemoPage({ params }) {
  const record = await getShortlist(params.id);
  if (!record) notFound();

  return <MemoClient record={record} />;
}
