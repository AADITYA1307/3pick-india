export const runtime = "nodejs";

import { randomUUID } from "crypto";
import { validateAnswers } from "../../../lib/questions.js";
import { scoreCatalog, buildMemo } from "../../../lib/score.js";
import { saveShortlist } from "../../../lib/store.js";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const answers = body?.answers;
  const error = validateAnswers(answers);
  if (error) return Response.json({ error }, { status: 400 });

  const result = scoreCatalog(answers);
  const memo = buildMemo(answers, result);
  const record = {
    id: randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    answers,
    path: result.path,
    shortlist: result.shortlist,
    skipped: result.skipped,
    weights: result.weights,
    memo,
  };
  await saveShortlist(record);
  return Response.json(record);
}
