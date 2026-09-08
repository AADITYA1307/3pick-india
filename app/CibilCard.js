"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "../lib/cars.js";
import { cibilLead } from "../lib/copy.js";
import {
  CIBIL_BANDS,
  CIBIL_GOOD,
  CIBIL_MAX,
  CIBIL_MIN,
  cibilBand,
  clampScore,
  financeForCibil,
  isValidPastedScore,
  unlocksForScore,
} from "../lib/cibil.js";

const CHECK_URL = "https://www.cibil.com/free-cibil-score/";

export default function CibilCard({ picks }) {
  const [score, setScore] = useState(CIBIL_GOOD);
  const [paste, setPaste] = useState("");

  const band = cibilBand(score);
  const rows = useMemo(
    () =>
      picks.map((p) => ({
        rank: p.rank,
        name: p.name,
        ...financeForCibil(p.finance, score),
      })),
    [picks, score]
  );

  const unlocks = useMemo(() => unlocksForScore(score, picks.map((p) => ({ ...p.finance, shortName: p.name }))), [score, picks]);

  function applyPaste() {
    if (isValidPastedScore(paste)) setScore(Number(paste.trim()));
  }

  return (
    <section className="cibil-card sans">
      <header className="cibil-card__head">
        <p className="cibil-card__kicker">About 90% of cars in India are financed</p>
        <h2 className="cibil-card__title">What does your CIBIL score do to EMI?</h2>
        <p className="cibil-card__lead">{cibilLead(picks.length)}</p>
      </header>

      <div className="cibil-card__slider-block">
        <div className="cibil-card__score-row">
          <span className="cibil-card__score">{score}</span>
          <span className={`cibil-card__band cibil-card__band--${band.label.toLowerCase()}`}>{band.label}</span>
        </div>
        <input
          type="range"
          className="cibil-card__slider"
          min={CIBIL_MIN}
          max={CIBIL_MAX}
          step={1}
          value={score}
          onChange={(e) => setScore(clampScore(e.target.value))}
          aria-label="CIBIL score slider"
        />
        <div className="cibil-card__bands">
          {CIBIL_BANDS.map((b) => (
            <span key={b.label} className={score >= b.min ? "is-active" : ""}>
              {b.min}+ {b.label}
            </span>
          ))}
        </div>
        <p className="cibil-card__hint">{band.hint}</p>
      </div>

      <div className="cibil-card__check">
        <a className="btn secondary" href={CHECK_URL} target="_blank" rel="noopener noreferrer">
          What is my CIBIL Score ?
        </a>
        <div className="cibil-card__paste">
          <label htmlFor="cibil-paste">Paste your 3-digit score (optional)</label>
          <div className="cibil-card__paste-row">
            <input
              id="cibil-paste"
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="e.g. 742"
              value={paste}
              onChange={(e) => setPaste(e.target.value.replace(/\D/g, "").slice(0, 3))}
            />
            <button type="button" className="btn" onClick={applyPaste} disabled={!isValidPastedScore(paste)}>
              Apply
            </button>
          </div>
        </div>
      </div>

      <table className="cibil-card__table">
        <thead>
          <tr>
            <th>Pick</th>
            <th>EMI @ {score}</th>
            <th>EMI @ 700</th>
            <th>All-in @ {score}</th>
            <th>Vs Good (700)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank}>
              <td>#{r.rank}</td>
              <td>
                {formatMoney(r.emi)}
                <span className="cibil-card__rate">{r.rate.toFixed(2)}%</span>
              </td>
              <td>
                {formatMoney(r.emiGood)}
                <span className="cibil-card__rate">{r.rateGood.toFixed(2)}%</span>
              </td>
              <td>{formatMoney(r.total)}</td>
              <td className={r.emiDeltaVsGood <= 0 ? "cibil-card__save" : "cibil-card__cost"}>
                {r.emiDeltaVsGood === 0
                  ? "Same as Good"
                  : r.emiDeltaVsGood < 0
                    ? `−${formatMoney(Math.abs(r.emiDeltaVsGood))}/mo EMI`
                    : `+${formatMoney(r.emiDeltaVsGood)}/mo EMI`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {unlocks.length ? (
        <div className="cibil-card__unlocks">
          <h3>What 750+ often unlocks</h3>
          <ul>
            {unlocks.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="cibil-card__fine fine">
        Illustrative rates for education — actual offers depend on bank, income, and model year. Check your real
        score on the bureau site, then negotiate with the lender.
      </p>
    </section>
  );
}
