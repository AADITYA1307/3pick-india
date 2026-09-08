"use client";

import Link from "next/link";
import MemoShare from "./MemoShare";

export default function MemoShareNext({ headline, picks, memoId, pickCount, onRunAgain }) {
  return (
    <section className="memo-section memo-share-next no-print">
      <h2>Share &amp; next</h2>
      {pickCount > 0 ? <MemoShare headline={headline} picks={picks} memoId={memoId} /> : null}
      <div className="memo-share-next__actions">
        <button className="btn secondary" type="button" onClick={onRunAgain}>
          Run it again with different constraints
        </button>
        <Link className="btn secondary" href="/">
          Start over
        </Link>
      </div>
    </section>
  );
}
