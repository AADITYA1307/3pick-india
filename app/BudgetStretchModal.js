"use client";

import { stretchOptionsPhrase } from "../lib/copy.js";

function listPhrase(names) {
  if (!names?.length) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function unlockPhrase(names) {
  if (!names?.length) return "a third option";
  if (names.length === 1) return names[0];
  return listPhrase(names);
}

export default function BudgetStretchModal({ open, offer, onYes, onNo }) {
  if (!open || !offer) return null;

  const isThird = offer.tier === "third";
  const isSecond = offer.tier === "second";
  const isTopUp = isThird || isSecond;

  let declineLabel = "Not right now";
  let acceptLabel = "Yes — show me";
  if (isThird && offer.currentCount === 2) {
    declineLabel = "Stay with these two";
    acceptLabel = "Show me all three";
  } else if (isThird && offer.currentCount === 1) {
    declineLabel = "Stay with this one";
    acceptLabel = "Show me all three";
  } else if (isSecond) {
    acceptLabel = "Yes — show all three";
  }

  return (
    <div className="exit-modal budget-stretch-modal" role="dialog" aria-modal="true" aria-labelledby="stretch-title">
      <div className="exit-modal__backdrop" onClick={onNo} aria-hidden="true" />
      <div className="exit-modal__panel sans">
        <h2 id="stretch-title" className="exit-modal__title">
          {isThird && offer.currentCount === 2
            ? "Want a third to compare?"
            : isThird
              ? "Want two more to compare?"
              : isSecond
                ? "Want two more options?"
                : "Nothing in this budget yet"}
        </h2>

        {isThird ? (
          <>
            <p className="exit-modal__text">
              {offer.currentCount === 2 ? (
                <>
                  Two cars fit your {offer.currentCapLabel}/month cap — <strong>{listPhrase(offer.currentCarNames)}</strong>.
                  Another <strong>{offer.extraLabel}</strong>/month unlocks <strong>{unlockPhrase(offer.newCarNames)}</strong>{" "}
                  so you have three to compare.
                </>
              ) : (
                <>
                  One car fits your {offer.currentCapLabel}/month cap — <strong>{listPhrase(offer.currentCarNames)}</strong>.
                  Another <strong>{offer.extraLabel}</strong>/month unlocks <strong>{unlockPhrase(offer.newCarNames)}</strong>{" "}
                  so you have three to compare.
                </>
              )}
            </p>
            {offer.firstStretchExtraLabel ? (
              <p className="budget-stretch-modal__note fine">
                You already added {offer.firstStretchExtraLabel}/month earlier. This is the honest top-up for a third
                — from your commute and all-in math, not a teaser rate.
              </p>
            ) : (
              <p className="budget-stretch-modal__note fine">
                Honest number from EMI + insurance + fuel + service at your km. Your {offer.currentCapLabel} cap stays
                until you say yes.
              </p>
            )}
          </>
        ) : isSecond ? (
          <>
            <p className="exit-modal__text">
              You already stretched by <strong>{offer.firstStretchExtraLabel}</strong>/month — that unlocked{" "}
              {offer.currentCount === 1 ? "one car" : `${offer.currentCount} cars`} at {offer.currentCapLabel}/month
              all-in. Another <strong>{offer.extraLabel}</strong>/month unlocks{" "}
              <strong>{unlockPhrase(offer.newCarNames)}</strong> so you&apos;re back to three options.
            </p>
            <p className="budget-stretch-modal__note fine">
              Your {offer.currentCapLabel} cap stays until you say yes. New picks show at {offer.newCapLabel}/month
              all-in.
            </p>
          </>
        ) : (
          <>
            <p className="exit-modal__text">
              We don&apos;t have anything at {offer.originalCapLabel}/month all-in. Another{" "}
              <strong>{offer.extraLabel}</strong> a month will get you {stretchOptionsPhrase(offer.optionCount)}.
              Interested?
            </p>
            <p className="budget-stretch-modal__note fine">
              Your {offer.originalCapLabel} cap stays as-is unless you say yes. We&apos;ll show picks at{" "}
              {offer.newCapLabel}/month all-in.
            </p>
          </>
        )}

        <div className="exit-modal__actions">
          <button type="button" className="btn secondary" onClick={onNo}>
            {declineLabel}
          </button>
          <button type="button" className="btn" onClick={onYes}>
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
