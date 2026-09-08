"use client";

import { useMemo } from "react";
import { whatsAppLead } from "../lib/copy.js";
import { buildWhatsAppMessage, whatsAppShareUrl } from "../lib/share.js";

export default function MemoShare({ headline, picks, memoId }) {
  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const memoUrl = `${origin}/m/${memoId}`;
    const text = buildWhatsAppMessage({ headline, picks, memoUrl });
    return whatsAppShareUrl(text);
  }, [headline, picks, memoId]);

  return (
    <article className="forward-card forward-card--share sans">
      <h2 className="forward-card__title">Send to family on WhatsApp</h2>
      <p className="forward-card__lead">
        {whatsAppLead(picks.length)} No phone number goes in the message — just the shortlist and a link to this
        memo.
      </p>
      <a className="btn btn--whatsapp" href={shareUrl} target="_blank" rel="noopener noreferrer">
        Share on WhatsApp
      </a>
    </article>
  );
}
