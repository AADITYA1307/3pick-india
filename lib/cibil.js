/** Illustrative rate bands — not a bureau pull or lender quote. */

export const CIBIL_MIN = 300;
export const CIBIL_MAX = 900;
export const CIBIL_GOOD = 700;
export const LOAN_MONTHS = 84;

export const CIBIL_BANDS = [
  { min: 750, label: "Excellent", hint: "Best rates and longest tenure options" },
  { min: 700, label: "Good", hint: "Benchmark — most bank car loans assume ~700" },
  { min: 650, label: "Average", hint: "May pay a small rate premium" },
  { min: 550, label: "Fair", hint: "Higher EMI or shorter tenure" },
  { min: 300, label: "Poor", hint: "Fewer lenders; larger down payment likely" },
];

export function emi(principal, annualPct, months = LOAN_MONTHS) {
  const r = annualPct / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
}

export function baseRate(condition = "new") {
  return condition === "cpo" ? 11.5 : 9.5;
}

/** Rate at a given CIBIL score vs 700 (Good) baseline. */
export function rateForCibil(score, condition = "new") {
  const base = baseRate(condition);
  if (score >= 750) return base - 0.75;
  if (score >= 700) return base - (score >= 735 ? 0.35 : 0);
  if (score >= 650) return base + 0.75;
  if (score >= 600) return base + 1.75;
  if (score >= 550) return base + 3;
  return base + 4.5;
}

export function cibilBand(score) {
  const s = clampScore(score);
  return CIBIL_BANDS.find((b) => s >= b.min) || CIBIL_BANDS[CIBIL_BANDS.length - 1];
}

export function clampScore(score) {
  return Math.max(CIBIL_MIN, Math.min(CIBIL_MAX, Math.round(Number(score) || CIBIL_GOOD)));
}

export function financeForCibil(finance, score) {
  const s = clampScore(score);
  const down = finance.condition === "cpo" ? 0.25 : 0.2;
  const principal = finance.onRoad * (1 - down);
  const rate = rateForCibil(s, finance.condition);
  const rateGood = rateForCibil(CIBIL_GOOD, finance.condition);
  const emiNow = Math.round(emi(principal, rate));
  const emiGood = Math.round(emi(principal, rateGood));
  const fixed = finance.insurance + finance.fuel + finance.service;
  return {
    score: s,
    rate,
    rateGood,
    emi: emiNow,
    emiGood,
    emiDeltaVsGood: emiNow - emiGood,
    total: emiNow + fixed,
    totalGood: emiGood + fixed,
    totalDeltaVsGood: emiNow + fixed - (emiGood + fixed),
  };
}

export function unlocksForScore(score, picksFinance) {
  const s = clampScore(score);
  if (s < 750) return [];
  const msgs = [];
  const band = cibilBand(s);
  msgs.push(`${band.label} (${s}) — banks typically offer their sharpest car-loan rates here.`);

  const top = picksFinance[0];
  if (top) {
    const atScore = financeForCibil(top, s);
    const at650 = financeForCibil(top, 650);
    const saveVs650 = at650.emi - atScore.emi;
    if (saveVs650 > 0) {
      msgs.push(
        `On ${top.shortName || "pick #1"}, EMI is about ₹${saveVs650.toLocaleString("en-IN")}/mo lower than at 650 (Average).`
      );
    }
    if (atScore.emiDeltaVsGood < 0) {
      msgs.push(
        `Vs Good (700): save ₹${Math.abs(atScore.emiDeltaVsGood).toLocaleString("en-IN")}/mo on EMI for pick #1.`
      );
    }
  }

  msgs.push("Higher approval odds and less pressure for a bigger down payment at 750+.");
  return msgs;
}

export function isValidPastedScore(text) {
  return /^\d{3}$/.test(String(text).trim()) && Number(text) >= CIBIL_MIN && Number(text) <= CIBIL_MAX;
}
