import { formatMoney, getCar } from "./cars.js";
import { scoreCatalog } from "./score.js";

export function roundStretchExtra(delta) {
  if (delta <= 0) return 1000;
  return Math.max(1000, Math.ceil(delta / 1000) * 1000);
}

function findMinCap(answers, fromCap, minPicks) {
  for (let cap = fromCap + 1; cap <= fromCap + 120000; cap += 250) {
    if (scoreCatalog({ ...answers, monthlyCap: cap }).shortlist.length >= minPicks) {
      return cap;
    }
  }
  return null;
}

function carNames(rows) {
  return rows.map((s) => {
    const car = getCar(s.carId);
    return `${car.make} ${car.model}`;
  });
}

/** Smallest cap bump (rounded) that yields at least one shortlist pick. */
export function budgetStretchOffer(answers) {
  const baseCap = Number(answers.monthlyCap);
  if (scoreCatalog(answers).shortlist.length > 0) return null;

  const neededCap = findMinCap(answers, baseCap, 1);
  if (neededCap === null) return null;

  const rawExtra = neededCap - baseCap;
  const extra = roundStretchExtra(rawExtra);
  const newCap = baseCap + extra;
  const atNew = scoreCatalog({ ...answers, monthlyCap: newCap });

  return {
    tier: "first",
    originalCap: baseCap,
    rawExtra,
    extraMonthly: extra,
    newCap,
    optionCount: atNew.shortlist.length,
    extraLabel: formatMoney(extra),
    originalCapLabel: formatMoney(baseCap),
    newCapLabel: formatMoney(newCap),
  };
}

/** 1–2 in-budget picks: real top-up to unlock a third (or reach three total). */
export function budgetThirdCarOffer(answers, { firstStretchExtra = 0 } = {}) {
  const currentCap = Number(answers.monthlyCap);
  const atCurrent = scoreCatalog(answers);
  const currentCount = atCurrent.shortlist.length;

  if (currentCount === 0 || currentCount >= 3) return null;

  const neededCap = findMinCap(answers, currentCap, 3);
  if (neededCap === null) return null;

  const rawExtra = neededCap - currentCap;
  const extra = roundStretchExtra(rawExtra);
  const newCap = currentCap + extra;
  const atNew = scoreCatalog({ ...answers, monthlyCap: newCap });

  if (atNew.shortlist.length <= currentCount) return null;

  const currentIds = new Set(atCurrent.shortlist.map((s) => s.carId));
  const newCarNames = carNames(atNew.shortlist.filter((s) => !currentIds.has(s.carId)));

  return {
    tier: "third",
    firstStretchExtra,
    firstStretchExtraLabel: firstStretchExtra > 0 ? formatMoney(firstStretchExtra) : null,
    currentCap,
    currentCapLabel: formatMoney(currentCap),
    currentCount,
    currentCarNames: carNames(atCurrent.shortlist),
    rawExtra,
    extraMonthly: extra,
    extraLabel: formatMoney(extra),
    newCap,
    newCapLabel: formatMoney(newCap),
    optionCount: atNew.shortlist.length,
    addedCount: atNew.shortlist.length - currentCount,
    newCarNames,
  };
}

/** @deprecated use budgetThirdCarOffer */
export function budgetSecondStretchOffer(answers, opts) {
  return budgetThirdCarOffer(answers, { firstStretchExtra: opts.firstStretchExtra });
}
