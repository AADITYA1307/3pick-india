import { notFound } from "next/navigation";
import MemoClient from "../../MemoClient";
import { getShortlist } from "../../../lib/store.js";

export const dynamic = "force-dynamic";

export default function MemoPage({ params }) {
  const record = getShortlist(params.id);
  if (!record) notFound();

  return <MemoClient record={record} />;
}
