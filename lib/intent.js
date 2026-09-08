import { baseRate, emi, LOAN_MONTHS } from "./cibil.js";

export const BUY_WHEN = [
  { id: "this_month", label: "This month" },
  { id: "1_3_months", label: "1–3 months" },
  { id: "3_6_months", label: "3–6 months" },
  { id: "researching", label: "Just researching" },
];

export const TRADE_IN = [
  { id: "none", label: "No car to sell" },
  { id: "owned", label: "Yes — fully paid off" },
  { id: "emi", label: "Yes — EMI still running" },
];

/** Generic outbound paths — labels in UI never name third-party brands. */
export const VALUATION_LINKS = {
  sell: "https://www.cardekho.com/sell-used-car",
  exchange: "https://www.cardekho.com/car-exchange-value",
};

function defaultDownPct(condition) {
  return condition === "cpo" ? 0.25 : 0.2;
}

function minDownPct(condition) {
  return condition === "cpo" ? 0.2 : 0.1;
}

export function netTradeIn({ tradeIn, exchangeValue = 0, emiLeft = 0 }) {
  if (tradeIn === "none") return 0;
  const gross = Math.max(0, Number(exchangeValue) || 0);
  const owed = tradeIn === "emi" ? Math.max(0, Number(emiLeft) || 0) : 0;
  return Math.max(0, gross - owed);
}

export function totalDown({ onRoad, condition, cashDown = 0, tradeIn = "none", exchangeValue = 0, emiLeft = 0 }) {
  const tradeNet = netTradeIn({ tradeIn, exchangeValue, emiLeft });
  const raw = Math.max(0, Number(cashDown) || 0) + tradeNet;
  const minDown = onRoad * minDownPct(condition);
  const maxDown = onRoad * 0.9;
  return Math.max(minDown, Math.min(maxDown, raw));
}

export function financeForIntent(finance, intent) {
  const rate = baseRate(finance.condition);
  const baselineDown = finance.onRoad * defaultDownPct(finance.condition);
  const baselinePrincipal = finance.onRoad - baselineDown;
  const baselineEmi = Math.round(emi(baselinePrincipal, rate));

  const down = totalDown({
    onRoad: finance.onRoad,
    condition: finance.condition,
    cashDown: intent.cashDown,
    tradeIn: intent.tradeIn,
    exchangeValue: intent.exchangeValue,
    emiLeft: intent.emiLeft,
  });

  const tradeNet = netTradeIn(intent);
  const principal = Math.max(finance.onRoad - down, finance.onRoad * 0.05);
  const emiNow = Math.round(emi(principal, rate, LOAN_MONTHS));
  const fixed = finance.insurance + finance.fuel + finance.service;

  return {
    down,
    cashDown: Math.max(0, Number(intent.cashDown) || 0),
    tradeNet,
    principal: Math.round(principal),
    rate,
    emi: emiNow,
    baselineEmi,
    emiDelta: emiNow - baselineEmi,
    total: emiNow + fixed,
    baselineTotal: baselineEmi + fixed,
  };
}

export function defaultCashDown(picks) {
  if (!picks.length) return 0;
  const top = picks[0].finance;
  return Math.round(top.onRoad * defaultDownPct(top.condition));
}

export function maxCashSlider(picks) {
  const maxOnRoad = Math.max(...picks.map((p) => p.finance.onRoad));
  return Math.round(maxOnRoad * 0.5);
}

export function buyWhenLabel(id) {
  return BUY_WHEN.find((b) => b.id === id)?.label || id;
}
