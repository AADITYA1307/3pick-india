"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "../lib/cars.js";
import { intentLead } from "../lib/copy.js";
import {
  BUY_WHEN,
  defaultCashDown,
  financeForIntent,
  maxCashSlider,
  TRADE_IN,
  VALUATION_LINKS,
} from "../lib/intent.js";

export default function IntentCard({ picks }) {
  const [buyWhen, setBuyWhen] = useState("1_3_months");
  const [tradeIn, setTradeIn] = useState("none");
  const [emiLeft, setEmiLeft] = useState("");
  const [exchangeValue, setExchangeValue] = useState("");
  const [cashDown, setCashDown] = useState(() => defaultCashDown(picks));

  const cashMax = maxCashSlider(picks);

  const intent = useMemo(
    () => ({
      buyWhen,
      tradeIn,
      emiLeft: emiLeft === "" ? 0 : Number(emiLeft),
      exchangeValue: exchangeValue === "" ? 0 : Number(exchangeValue),
      cashDown,
    }),
    [buyWhen, tradeIn, emiLeft, exchangeValue, cashDown]
  );

  const rows = useMemo(() => picks.map((p) => ({ rank: p.rank, name: p.name, ...financeForIntent(p.finance, intent) })), [picks, intent]);

  const tradeNet = rows[0]?.tradeNet || 0;

  return (
    <section className="intent-card sans">
      <header className="intent-card__head">
        <p className="intent-card__kicker">Buying intent</p>
        <h2 className="intent-card__title">When, trade-in, and down payment</h2>
        <p className="intent-card__lead">{intentLead(picks.length)}</p>
      </header>

      <div className="intent-block">
        <h3>When are you buying?</h3>
        <div className="pills">
          {BUY_WHEN.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`pill ${buyWhen === b.id ? "selected" : ""}`}
              onClick={() => setBuyWhen(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="intent-block">
        <h3>Do you have a car to sell or exchange?</h3>
        <div className="pills">
          {TRADE_IN.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pill ${tradeIn === t.id ? "selected" : ""}`}
              onClick={() => setTradeIn(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tradeIn !== "none" ? (
          <div className="intent-trade">
            <p className="intent-trade__links">
              <a href={VALUATION_LINKS.sell} target="_blank" rel="noopener noreferrer">
                What is my current car worth?
              </a>
              <span aria-hidden="true"> · </span>
              <a href={VALUATION_LINKS.exchange} target="_blank" rel="noopener noreferrer">
                Check exchange value
              </a>
            </p>
            <label className="intent-field">
              Estimated value of your current car (optional)
              <input
                type="number"
                min={0}
                step={10000}
                placeholder="e.g. 450000"
                value={exchangeValue}
                onChange={(e) => setExchangeValue(e.target.value)}
              />
            </label>
            {tradeIn === "emi" ? (
              <label className="intent-field">
                EMI still left on current car (optional)
                <input
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="e.g. 120000"
                  value={emiLeft}
                  onChange={(e) => setEmiLeft(e.target.value)}
                />
              </label>
            ) : null}
            {tradeNet > 0 ? (
              <p className="intent-trade__net fine">
                Net exchange credit toward down payment: <strong>{formatMoney(tradeNet)}</strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="intent-block">
        <h3>How much cash can you put down this week?</h3>
        <div className="intent-cash-row">
          <span className="intent-cash-value">{formatMoney(cashDown)}</span>
        </div>
        <input
          type="range"
          className="intent-slider"
          min={0}
          max={cashMax}
          step={10000}
          value={Math.min(cashDown, cashMax)}
          onChange={(e) => setCashDown(Number(e.target.value))}
          aria-label="Cash down payment slider"
        />
        <p className="fine">Cash only — exchange credit above is added on top.</p>
      </div>

      <table className="intent-table">
        <thead>
          <tr>
            <th>Pick</th>
            <th>Total down</th>
            <th>EMI now</th>
            <th>EMI @ 20% down</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rank}>
              <td>#{r.rank}</td>
              <td>
                {formatMoney(r.down)}
                {r.tradeNet > 0 ? (
                  <span className="intent-table__sub">
                    {formatMoney(r.cashDown)} cash + {formatMoney(r.tradeNet)} exchange
                  </span>
                ) : null}
              </td>
              <td>
                {formatMoney(r.emi)}
                <span className="intent-table__sub">{r.rate.toFixed(2)}% · {formatMoney(r.total)}/mo all-in</span>
              </td>
              <td>{formatMoney(r.baselineEmi)}</td>
              <td className={r.emiDelta <= 0 ? "intent-save" : "intent-cost"}>
                {r.emiDelta === 0 ? "Same" : r.emiDelta < 0 ? `−${formatMoney(Math.abs(r.emiDelta))}/mo` : `+${formatMoney(r.emiDelta)}/mo`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="intent-card__fine fine">
        Illustrative loan math at Good (700) rates — dealer and bank will confirm final down payment, settlement,
        and approval.
      </p>
    </section>
  );
}
