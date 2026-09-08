"use client";

import { useState } from "react";
import MemoCarDetailModal from "./MemoCarDetailModal";

function MemoCarPills({ items, onSelect }) {
  if (!items.length) return null;

  return (
    <div className="memo-car-pills pills sans">
      {items.map((item) => (
        <button key={item.key} type="button" className="pill pill--memo-car" onClick={() => onSelect(item.detail)}>
          <span className="pill--memo-car__name">{item.label}</span>
          {item.meta ? <span className="pill--memo-car__meta">{item.meta}</span> : null}
        </button>
      ))}
    </div>
  );
}

export default function MemoDetailSection({ selectionMemo, deniedInCap, skipped, picks, pickCount }) {
  const [detail, setDetail] = useState(null);

  if (!selectionMemo) return null;

  const pickItems = picks.map((p) => ({
    key: `pick-${p.rank}`,
    label: `#${p.rank} ${p.name}`,
    meta: `${p.score}/100`,
    detail: { type: "pick", pick: p },
  }));

  const deniedItems = (deniedInCap || []).map((d) => ({
    key: `denied-${d.carId}`,
    label: d.name,
    meta: `${d.score}/100`,
    detail: { type: "denied", ...d },
  }));

  const skippedItems = (skipped || []).map((s, i) => ({
    key: `skipped-${s.name}-${i}`,
    label: s.name,
    meta: s.score != null ? `${s.score}/100` : null,
    detail: { type: "skipped", ...s },
  }));

  return (
    <>
      <section className="memo-section memo-detail">
        <h2>Why these {pickCount === 1 ? "pick" : "picks"} — Full Memo</h2>
        <p className="memo-detail__intro">{selectionMemo.intro}</p>
        <ol className="memo-detail__method sans">
          {selectionMemo.methodology.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        {pickItems.length > 0 ? (
          <div className="memo-detail__picks">
            <h3 className="sans">Each pick, in order</h3>
            <p className="fine sans memo-car-pills__hint">Tap a car for score, why, and all-in breakdown.</p>
            <MemoCarPills items={pickItems} onSelect={setDetail} />
          </div>
        ) : null}
      </section>

      {deniedItems.length > 0 ? (
        <section className="memo-section memo-denied">
          <h2>In your cap, but not in your {pickCount === 1 ? "one" : pickCount === 2 ? "two" : "three"}</h2>
          <p className="memo-detail__intro sans">
            These fit your all-in monthly cap and passed hard rules, but scored lower or duplicated a brand/body
            style already on your memo.
          </p>
          <p className="fine sans memo-car-pills__hint">Tap a car for score and why it missed the cut.</p>
          <MemoCarPills items={deniedItems} onSelect={setDetail} />
        </section>
      ) : null}

      {skippedItems.length > 0 ? (
        <section className="memo-section memo-skipped">
          <h2>Already no — hard rules or over cap</h2>
          <p className="memo-detail__intro sans">
            Ruled out before or during scoring — not in your monthly cap, or failed a hard rule from the
            interview.
          </p>
          <p className="fine sans memo-car-pills__hint">Tap a car for the rule or cap reason.</p>
          <MemoCarPills items={skippedItems} onSelect={setDetail} />
        </section>
      ) : null}

      <MemoCarDetailModal open={Boolean(detail)} detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
