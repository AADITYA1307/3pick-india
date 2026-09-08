import { CARS, BODY_LABELS, formatMoney, formatLakh } from "./cars.js";
import { CITIES, HARD_NOS } from "./questions.js";
import { araiMileageLabel, getCarSpecs, serviceIntervalLabel } from "./carSpecs.js";
import {
  dealerNextStep,
  emptyCapReason,
  memoHeadline,
  pickCount,
} from "./copy.js";
import { MEMO_DISCLAIMERS } from "./memoDetail.js";

export const SAFETY_FLOOR = 4;
export const TIGHT_CAP = 20000;
const FAMILY = new Set(["kids", "third_row"]);
const CNG_OK = new Set(["mumbai", "delhi", "pune"]);

function clamp(n, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n));
}

function band(value, ideal, slack) {
  return clamp(100 - (Math.abs(value - ideal) / slack) * 100);
}

function emi(principal, annualPct, months = 84) {
  const r = annualPct / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
}

export function monthlyKm(answers) {
  return Number(answers.commuteKm || 0) * 26;
}

export function monthlyFuel(car, answers) {
  const km = monthlyKm(answers);
  if (car.fuel === "ev") return (km / (car.kmPerKwh || 6.5)) * 8.5;
  const price = { petrol: 96, diesel: 89, cng: 76 }[car.fuel] || 96;
  return (km / (car.kmpl || 15)) * price;
}

function monthlyInsurance(car) {
  const rate = car.condition === "cpo" ? 0.04 : 0.03;
  return (car.onRoad * rate) / 12;
}

function monthlyService(car) {
  const base = { small: 700, medium: 1100, large: 1600 }[car.size] || 1100;
  if (car.fuel === "ev") return 450;
  if (car.condition === "cpo") return base + 400;
  return base;
}

export function allInMonthly(car, answers) {
  const down = car.condition === "cpo" ? 0.25 : 0.2;
  const rate = car.condition === "cpo" ? 11.5 : 9.5;
  const principal = car.onRoad * (1 - down);
  const emiAmt = emi(principal, rate);
  const insurance = monthlyInsurance(car);
  const fuel = monthlyFuel(car, answers);
  const service = monthlyService(car);
  return {
    emi: emiAmt,
    insurance,
    fuel,
    service,
    total: emiAmt + insurance + fuel + service,
  };
}

export function hasHomeCharger(answers) {
  return answers.charger === true;
}

export function isFamily(answers) {
  return FAMILY.has(answers.household);
}

/** new = CPO blocked. used_ok = CPO allowed because the monthly cap is tight. */
export function ownershipPath(answers) {
  const nos = answers.hardNos || [];
  if (nos.includes("must_new")) return "new";
  if (Number(answers.monthlyCap) <= TIGHT_CAP) return "used_ok";
  return "new";
}

export function weightsFor(answers) {
  const w = {
    budget: 22,
    space: 14,
    week: 12,
    fuel: 10,
    parking: 10,
    safety: 8,
    reliability: 10,
    running: 8,
    trip: 6,
  };
  if (isFamily(answers)) w.safety += 10;
  if (answers.badRoads) w.week += 6;
  if (hasHomeCharger(answers) && !(answers.hardNos || []).includes("no_ev")) w.fuel += 6;
  if (Number(answers.keepYears) >= 8) w.reliability += 8;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(w)) w[k] = w[k] / total;
  return w;
}

function budgetScore(car, answers, allIn) {
  const cap = Number(answers.monthlyCap);
  if (allIn.total > cap) return clamp(35 - (allIn.total - cap) / 400);
  return band(allIn.total, cap * 0.78, cap * 0.45);
}

function spaceScore(car, answers) {
  const h = answers.household;
  let score = 55;
  if (h === "solo") {
    score = car.size === "small" ? 92 : car.size === "medium" ? 74 : 38;
    if (car.seats >= 7) score -= 22;
  }
  if (h === "couple") {
    score = car.size === "large" ? 60 : 86;
    if (car.seats >= 7) score -= 10;
  }
  if (h === "kids") {
    score = car.seats >= 5 ? 74 : 20;
    if (["compact-suv", "mid-suv", "mpv", "mpv-suv"].includes(car.body)) score += 12;
    if (car.body === "sedan" || car.body === "hatch") score -= 6;
  }
  if (h === "third_row") {
    score = car.seats >= 7 ? 92 : 25;
    if (car.body === "mpv" || car.body === "mpv-suv") score += 8;
    if (car.size === "small") score -= 20;
  }
  return clamp(score);
}

function weekScore(car, answers) {
  const km = monthlyKm(answers);
  let s = 55;
  if (km <= 700) s = car.parking * 8 + (car.size === "small" ? 16 : 0) - (car.size === "large" ? 18 : 0);
  else if (km >= 1800) s = car.comfort * 6 + car.trip * 4 + (car.fuel === "diesel" || car.fuel === "hybrid" ? 10 : 0);
  else s = 62 + (car.body.includes("suv") || car.body === "mpv" ? 10 : 4);
  if (answers.badRoads) {
    s = (s + car.clearance * 10 + (car.body.includes("suv") ? 12 : 0) - (car.body === "sedan" ? 22 : 0)) / 2;
  }
  if (answers.household === "third_row" && car.seats >= 7) s += 8;
  return clamp(s);
}

function fuelScore(car, answers) {
  const nos = answers.hardNos || [];
  const km = monthlyKm(answers);
  if (car.fuel === "ev") return hasHomeCharger(answers) && !nos.includes("no_ev") ? 92 : 12;
  if (car.fuel === "cng") return CNG_OK.has(answers.city) ? 88 : 12;
  if (car.fuel === "diesel") {
    if (nos.includes("no_diesel")) return 8;
    return km >= 1500 ? 88 : 58;
  }
  if (car.fuel === "hybrid") return 86;
  return 76;
}

function parkingScore(car, answers) {
  if (answers.parking === "street") return clamp(car.parking * 11 - (car.size === "large" ? 28 : 0));
  if (answers.parking === "apartment") return clamp(52 + car.parking * 5 - (car.size === "large" ? 14 : 0));
  return clamp(72 + (car.size === "large" ? 4 : 6));
}

function safetyScore(car, answers) {
  if (car.safety <= 0) return isFamily(answers) ? 8 : 40;
  const base = car.safety * 20;
  if (isFamily(answers) && car.safety >= SAFETY_FLOOR) return clamp(base + 10);
  return clamp(base);
}

function reliabilityScore(car, answers) {
  let s = car.reliability * 10;
  if (Number(answers.keepYears) >= 8 && car.condition === "cpo") s -= 25;
  return clamp(s);
}

function runningScore(allIn) {
  return clamp(100 - (allIn.total - 12000) / 500);
}

function tripScore(car, answers) {
  let s = car.trip * 8 + Math.min(18, car.cargo / 2) + car.comfort * 2;
  if (car.fuel === "ev") s += (car.rangeKm || 0) >= 350 ? 6 : -10;
  if (car.body === "sedan" && answers.badRoads) s -= 20;
  if (Number(answers.keepYears) >= 8 && car.fuel === "ev") s -= 8;
  return clamp(s);
}

export function hardPenalty(car, answers, allIn) {
  const reasons = [];
  let penalty = 0;
  const nos = answers.hardNos || [];
  const cap = Number(answers.monthlyCap);

  if (car.fuel === "ev" && !hasHomeCharger(answers)) {
    penalty += 80;
    reasons.push("Already no: EV without a home charger");
  }
  if (car.fuel === "ev" && nos.includes("no_ev")) {
    penalty += 80;
    reasons.push("Already no: you ruled out EV");
  }
  if (car.fuel === "diesel" && nos.includes("no_diesel")) {
    penalty += 80;
    reasons.push("Already no: you ruled out diesel");
  }
  if (nos.includes("must_auto") && !car.auto) {
    penalty += 80;
    reasons.push("Already no: must be automatic");
  }
  if (car.fuel === "cng" && !CNG_OK.has(answers.city)) {
    penalty += 80;
    reasons.push(`Already no: no CNG network in ${CITIES[answers.city]?.label || answers.city}`);
  }
  if (isFamily(answers) && car.safety < SAFETY_FLOOR) {
    penalty += 80;
    reasons.push(
      car.safety <= 0
        ? "Already no: no 4-star crash rating on file for a family car"
        : `Already no: ${car.safety}-star safety, family needs 4-star or better`
    );
  }
  if (answers.household === "third_row" && car.seats < 7) {
    penalty += 80;
    reasons.push("Already no: you asked for a third row");
  }
  if (car.condition === "cpo" && ownershipPath(answers) === "new") {
    penalty += 80;
    reasons.push(
      nos.includes("must_new")
        ? "Already no: you said it must be new"
        : "Already no: used/CPO only when the all-in cap is tight"
    );
  }
  if (car.condition === "cpo" && Number(answers.keepYears) >= 8) {
    penalty += 40;
    reasons.push("Already no: a used car is a weak 8-year hold");
  }
  if (allIn.total > cap * 1.08) {
    penalty += 40;
    reasons.push("Already no: all-in monthly (EMI + insurance + fuel + service) above your cap");
  }
  if (answers.parking === "street" && car.size === "large") {
    penalty += 28;
    reasons.push("Already no: too big for street parking");
  }
  if (car.id === "creta" && (allIn.total > cap || answers.parking === "street")) {
    if (!reasons.some((r) => r.includes("Creta"))) {
      reasons.push("Creta is India’s default yes — still no for this cap or parking");
    }
  }
  return { penalty, reasons };
}

/** already_no | stretch | fit */
export function verdict(car, answers, allIn = allInMonthly(car, answers)) {
  const { penalty, reasons } = hardPenalty(car, answers, allIn);
  if (penalty >= 80 || reasons.some((r) => r.startsWith("Already no:"))) {
    const hard = reasons.filter((r) => r.startsWith("Already no:"));
    return { code: "already_no", reasons: hard.length ? hard : reasons };
  }
  const cap = Number(answers.monthlyCap);
  if (allIn.total > cap) return { code: "already_no", reasons: ["Already no: all-in monthly above your cap"] };
  if (allIn.total > cap * 0.92) return { code: "stretch", reasons: [] };
  return { code: "fit", reasons: [] };
}

function reasonsFor(car, answers, parts, allIn) {
  const labeled = [
    ["Fits the all-in monthly cap", parts.budget],
    ["Fits who actually rides", parts.space],
    ["Fits commute and roads", parts.week],
    ["Matches fuel / charger / CNG reality", parts.fuel],
    ["Fits where it parks", parts.parking],
    ["Crash rating", parts.safety],
    ["Service and reliability", parts.reliability],
    ["Cheap enough to live with", parts.running],
    ["Outstation-ready", parts.trip],
  ].sort((a, b) => b[1] - a[1]);
  const top = labeled.slice(0, 3).map(([label]) => label);
  if (isFamily(answers) && car.safety >= SAFETY_FLOOR) {
    top[0] = `${car.safety}-star (${car.safetySource}) — clears the family floor`;
  }
  if (allIn.total <= Number(answers.monthlyCap)) {
    top[1] = `All-in about ${formatMoney(allIn.total)}/month`;
  }
  return top.slice(0, 3);
}

function skipReason(car, answers, total, allIn) {
  const { reasons } = hardPenalty(car, answers, allIn);
  if (reasons.length) return reasons[0];
  if (car.id === "creta") return "Creta is popular; others fit this interview better";
  if (total < 45) {
    if (car.fuel === "ev") return "EV complexity didn’t earn the slot";
    if (answers.household === "solo" && car.size === "large") return "Oversized for just you";
    return "Weaker fit across all-in cost, space, and commute";
  }
  return "Close, but the top three fit more of the interview";
}

function diversify(ranked, answers) {
  const picked = [];
  const wantEv = hasHomeCharger(answers) && !(answers.hardNos || []).includes("no_ev");
  for (const row of ranked) {
    if (picked.length >= 3) break;
    const sameMake = picked.filter((p) => p.car.make === row.car.make).length;
    const sameBody = picked.filter((p) => p.car.body === row.car.body).length;
    if (picked.length >= 1 && sameMake >= 2) continue;
    const allowSameBody = wantEv && row.car.fuel === "ev";
    if (picked.length >= 2 && sameBody >= 2 && !allowSameBody) continue;
    picked.push(row);
  }
  for (const row of ranked) {
    if (picked.length >= 3) break;
    if (!picked.find((p) => p.car.id === row.car.id)) picked.push(row);
  }
  return picked.slice(0, 3);
}

export function scoreCatalog(answers, cars = CARS) {
  const weights = weightsFor(answers);
  const scored = cars.map((car) => {
    const allIn = allInMonthly(car, answers);
    const parts = {
      budget: budgetScore(car, answers, allIn),
      space: spaceScore(car, answers),
      week: weekScore(car, answers),
      fuel: fuelScore(car, answers),
      parking: parkingScore(car, answers),
      safety: safetyScore(car, answers),
      reliability: reliabilityScore(car, answers),
      running: runningScore(allIn),
      trip: tripScore(car, answers),
    };
    const raw = Object.keys(weights).reduce((s, k) => s + parts[k] * weights[k], 0);
    const { penalty, reasons: penalties } = hardPenalty(car, answers, allIn);
    const v = verdict(car, answers, allIn);
    const total = clamp(raw - penalty);
    return {
      car,
      allIn,
      verdict: v,
      parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(v)])),
      total: Math.round(total),
      penalties,
      why: reasonsFor(car, answers, parts, allIn),
    };
  });

  scored.sort((a, b) => b.total - a.total);
  const cap = Number(answers.monthlyCap);
  const viable = scored.filter(
    (s) =>
      s.total >= 40 &&
      s.verdict.code !== "already_no" &&
      Math.round(s.allIn.total) <= cap
  );
  const shortlist = diversify(viable, answers).map((row, i) => ({
    rank: i + 1,
    carId: row.car.id,
    total: row.total,
    verdict: row.verdict.code,
    parts: row.parts,
    why: row.why,
    penalties: row.penalties,
    allIn: {
      emi: Math.round(row.allIn.emi),
      insurance: Math.round(row.allIn.insurance),
      fuel: Math.round(row.allIn.fuel),
      service: Math.round(row.allIn.service),
      total: Math.round(row.allIn.total),
    },
  }));

  const shortlistIds = new Set(shortlist.map((s) => s.carId));
  const notable = new Set(["creta", "seltos", "ertiga-cng", "wagonr-cng", "nexon-ev", "innova-hycross", "swift"]);
  const rest = scored.filter((s) => !shortlistIds.has(s.car.id));
  const hard = rest.filter((s) => s.penalties.length || notable.has(s.car.id));
  hard.sort((a, b) => {
    const ap = a.penalties.length ? 0 : 1;
    const bp = b.penalties.length ? 0 : 1;
    if (ap !== bp) return ap - bp;
    const rank = (s) => {
      const r = s.penalties[0] || "";
      if (/CNG|charger|star|CPO|used|automatic|diesel|EV/i.test(r)) return 0;
      if (s.car.id === "creta") return 1;
      if (/all-in/i.test(r)) return 2;
      return 3;
    };
    return rank(a) - rank(b) || b.total - a.total;
  });
  const skipped = [];
  const seen = new Set();
  for (const s of [...hard, ...rest]) {
    if (seen.has(s.car.id) || skipped.length >= 8) continue;
    seen.add(s.car.id);
    skipped.push({
      carId: s.car.id,
      total: s.total,
      verdict: s.verdict.code,
      reason: skipReason(s.car, answers, s.total, s.allIn),
    });
  }

  return { weights, path: ownershipPath(answers), shortlist, skipped, scoredAll: scored };
}

export function pickRankLabel(rank) {
  if (rank === 1) return "Strongly Recommended";
  if (rank === 2) return "Recommended";
  return "Worth Considering";
}

export function labelAnswers(answers) {
  const hh = { solo: "Just me", couple: "Two adults", kids: "Kids", third_row: "Need a third row" };
  const park = { apartment: "Apartment", house: "House", street: "Street" };
  const nos = (answers.hardNos || []).map((id) => HARD_NOS.find((h) => h.id === id)?.label || id);
  return {
    city: CITIES[answers.city]?.label || answers.city,
    household: hh[answers.household] || answers.household,
    commute: `${answers.commuteKm} km daily${answers.badRoads ? ", bad roads" : ""}`,
    parking: `${park[answers.parking] || answers.parking} · home charger: ${answers.charger ? "yes" : "no"}`,
    monthlyCap: `${formatMoney(answers.monthlyCap)} all-in cap`,
    keepYears: `${answers.keepYears} years`,
    hardNos: nos.length ? nos.join(", ") : "None",
  };
}

const MEMO_PART_LABELS = {
  budget: "all-in monthly fit",
  space: "who rides",
  week: "commute and roads",
  fuel: "fuel, CNG, or EV fit",
  parking: "where it parks",
  safety: "crash rating",
  reliability: "service and reliability",
  running: "running cost",
  trip: "outstation use",
};

function weakestMemoParts(parts, weights, n = 2) {
  return Object.entries(parts)
    .map(([k, v]) => ({ k, weighted: v * (weights[k] || 0) }))
    .sort((a, b) => a.weighted - b.weighted)
    .slice(0, n)
    .map((x) => MEMO_PART_LABELS[x.k] || x.k);
}

export function whyDeniedInCap(row, pickedRows, answers) {
  const weights = weightsFor(answers);
  const scores = pickedRows.map((p) => p.total);
  const top = scores.length ? Math.max(...scores) : 0;
  const floor = scores.length ? Math.min(...scores) : 0;

  const sameMake = pickedRows.filter((p) => p.car.make === row.car.make).length;
  const sameBody = pickedRows.filter((p) => p.car.body === row.car.body).length;

  if (pickedRows.length >= 2 && sameMake >= 2) {
    return `${row.car.make} is already on your memo twice — we spread brands so you compare different OEMs.`;
  }
  if (pickedRows.length >= 2 && sameBody >= 2) {
    const body = BODY_LABELS[row.car.body] || row.car.body;
    return `You already have two ${body}-class picks — we diversified body styles.`;
  }
  if (row.total < floor - 6) {
    const weak = weakestMemoParts(row.parts, weights);
    return `Scored ${row.total}/100 vs your picks (${floor}–${top}). Weaker on ${weak.join(" and ")}.`;
  }
  if (row.car.id === "creta") {
    return "Creta is popular, but others scored higher for your commute, cap, and household.";
  }
  return `Scored ${row.total}/100 — within your cap, but the top picks fit more of your interview (${floor}–${top}/100).`;
}

export function buildDeniedInCap(answers, result) {
  const cap = Number(answers.monthlyCap);
  const shortlistIds = new Set(result.shortlist.map((s) => s.carId));
  const pickedRows = result.shortlist
    .map((s) => result.scoredAll.find((r) => r.car.id === s.carId))
    .filter(Boolean);

  return result.scoredAll
    .filter(
      (row) =>
        !shortlistIds.has(row.car.id) &&
        row.verdict.code !== "already_no" &&
        Math.round(row.allIn.total) <= cap &&
        row.total >= 40
    )
    .sort((a, b) => b.total - a.total)
    .map((row) => ({
      carId: row.car.id,
      name: `${row.car.make} ${row.car.model}`,
      score: row.total,
      allIn: formatMoney(row.allIn.total),
      reason: whyDeniedInCap(row, pickedRows, answers),
    }));
}

export function buildSelectionMemo(answers, result, picks) {
  const labels = labelAnswers(answers);
  const cap = formatMoney(Number(answers.monthlyCap));
  const count = picks.length;

  const methodology = [
    `We scored every car in our catalog against your interview — ${labels.city}, ${labels.household.toLowerCase()}, ${labels.commute}, ${labels.parking}, ${labels.monthlyCap}, keeping it ${labels.keepYears}.`,
    "Each model gets a 0–100 fit score from nine weighted dimensions: all-in monthly cost, who rides, commute and roads, fuel/CNG/EV fit, parking, crash rating, service reliability, running cost, and outstation use. Weights shift when you mention kids (safety), bad roads (ground clearance), or a home charger (EV).",
    "Hard rules run first — no EV without a home charger, 4-star minimum for kids or a third row, CNG only in Delhi-NCR/Mumbai/Pune, used/CPO only on a tight cap unless you hard-no it, and anything above your all-in cap is out before scoring.",
    count > 0
      ? `Only cars at or below ${cap}/month all-in (EMI + insurance + fuel + service at your km) were eligible. We then kept up to three highest scorers, diversifying make and body style so you are not staring at three variants of the same car.`
      : `Nothing cleared ${cap}/month all-in once EMI, insurance, fuel for your commute, and service are counted.`,
  ];

  const pickSummaries = picks.map((p) => {
    const whyText = p.why?.length ? p.why.join("; ") : "Strongest overall fit for your answers.";
    return {
      rank: p.rank,
      name: p.name,
      rankLabel: p.rankLabel,
      score: p.score,
      allIn: p.allIn,
      summary: `${p.rankLabel} (#${p.rank}) at ${p.score}/100 — ${whyText}. All-in ${p.allIn}/month: ${p.breakdown}.`,
    };
  });

  let intro;
  if (count === 0) {
    intro = "No car in our catalog fits your cap with your hard rules. Below are common reasons others were ruled out.";
  } else if (count === 1) {
    intro = "One car cleared your cap and scored highest across your interview. Here is the full reasoning.";
  } else if (count === 2) {
    intro = "Two cars fit your cap with the best scores. We stopped at two because nothing else cleared the bar without stretching.";
  } else {
    intro = "Three cars fit your cap with the highest scores after diversification. Here is why each earned a slot.";
  }

  return { intro, methodology, pickSummaries };
}

export function buildMemo(answers, result) {
  const labels = labelAnswers(answers);
  const picks = result.shortlist.map((row) => {
    const car = CARS.find((c) => c.id === row.carId);
    const specs = getCarSpecs(car.id);
    return {
      rank: row.rank,
      rankLabel: pickRankLabel(row.rank),
      carId: car.id,
      name: `${car.year} ${car.make} ${car.model} ${car.trim}`,
      condition: car.condition === "cpo" ? "Used / CPO" : "New",
      body: BODY_LABELS[car.body],
      oem: specs.oem,
      indiaSales: specs.indiaSalesFY26,
      colours: specs.colours,
      araiMileage: araiMileageLabel(car),
      serviceInterval: serviceIntervalLabel(specs.serviceIntervalKm),
      onRoad: formatLakh(car.onRoad),
      allIn: formatMoney(row.allIn.total),
      breakdown: `EMI ${formatMoney(row.allIn.emi)} + insurance ${formatMoney(row.allIn.insurance)} + fuel ${formatMoney(row.allIn.fuel)} + service ${formatMoney(row.allIn.service)}`,
      mpgLabel: car.fuel === "ev" ? `${car.rangeKm} km claimed` : `${car.kmpl} ${car.fuel === "cng" ? "km/kg" : "km/l"}`,
      fuel: car.fuel,
      seats: car.seats,
      safety: car.safety > 0 ? `${car.safety}-star ${car.safetySource}` : "No 4-star rating on file",
      summary: car.summary,
      caveat: car.caveat,
      score: row.total,
      verdict: row.verdict,
      why: row.why,
      finance: {
        onRoad: car.onRoad,
        condition: car.condition,
        insurance: Math.round(row.allIn.insurance),
        fuel: Math.round(row.allIn.fuel),
        service: Math.round(row.allIn.service),
      },
    };
  });

  return {
    headline: memoHeadline({
      count: pickCount(result.shortlist.length),
      city: labels.city,
      household: labels.household,
      monthlyCap: labels.monthlyCap,
    }),
    pickCount: result.shortlist.length,
    interview: labels,
    path: result.path,
    picks,
    selectionMemo: buildSelectionMemo(answers, result, picks),
    deniedInCap: buildDeniedInCap(answers, result),
    disclaimers: MEMO_DISCLAIMERS,
    emptyReason: result.shortlist.length === 0 ? emptyCapReason(labels.monthlyCap) : null,
    skipped: result.skipped.map((s) => {
      const car = CARS.find((c) => c.id === s.carId);
      return { name: `${car.make} ${car.model}`, reason: s.reason, score: s.total, verdict: s.verdict };
    }),
    nextStep:
      result.shortlist.length > 0
        ? dealerNextStep(result.shortlist.length)
        : "Your cap is still in place. Adjust answers from home if you want to try a different mix.",
  };
}
