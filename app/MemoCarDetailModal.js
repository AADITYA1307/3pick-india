"use client";

function rankClass(label) {
  if (label === "Strongly Recommended") return "car-card__rank--strong";
  if (label === "Recommended") return "car-card__rank--good";
  return "car-card__rank--consider";
}

export default function MemoCarDetailModal({ open, detail, onClose }) {
  if (!open || !detail) return null;

  const titleId = "memo-car-modal-title";

  return (
    <div
      className="exit-modal memo-car-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="exit-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="exit-modal__panel memo-car-modal__panel sans">
        <button type="button" className="memo-car-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {detail.type === "pick" ? (
          <>
            <span className={`car-card__rank sans ${rankClass(detail.pick.rankLabel)}`}>{detail.pick.rankLabel}</span>
            <h2 id={titleId} className="memo-car-modal__title">
              #{detail.pick.rank} {detail.pick.name}
            </h2>
            <p className="memo-car-modal__meta">
              {detail.pick.score}/100 · {detail.pick.allIn}/mo all-in
            </p>
            <p className="memo-car-modal__text">{detail.pick.summary}</p>
            {detail.pick.why?.length ? (
              <section className="memo-car-modal__section">
                <h3>Why this car for you</h3>
                <ul>
                  {detail.pick.why.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="memo-car-modal__section">
              <h3>All-in monthly</h3>
              <p className="memo-car-modal__all-in">{detail.pick.allIn}/mo</p>
              <p className="fine">{detail.pick.breakdown}</p>
            </section>
            {detail.pick.caveat ? (
              <p className="memo-car-modal__watch">
                <em>Watch:</em> {detail.pick.caveat}
              </p>
            ) : null}
          </>
        ) : null}

        {detail.type === "denied" ? (
          <>
            <h2 id={titleId} className="memo-car-modal__title">
              {detail.name}
            </h2>
            <p className="memo-car-modal__meta">
              {detail.score}/100 · {detail.allIn}/mo all-in
            </p>
            <p className="memo-car-modal__text">{detail.reason}</p>
          </>
        ) : null}

        {detail.type === "skipped" ? (
          <>
            <h2 id={titleId} className="memo-car-modal__title">
              {detail.name}
            </h2>
            {detail.score != null ? <p className="memo-car-modal__meta">{detail.score}/100 fit score</p> : null}
            <p className="memo-car-modal__text">{detail.reason}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
