import assert from "node:assert/strict";
import { test } from "node:test";
import { getCar } from "../lib/cars.js";
import {
  SAFETY_FLOOR,
  TIGHT_CAP,
  hardPenalty,
  ownershipPath,
  pickRankLabel,
  scoreCatalog,
  buildMemo,
  verdict,
} from "../lib/score.js";
import { financeForCibil } from "../lib/cibil.js";
import { buildCommuteSummary } from "../lib/commute.js";
import { financeForIntent, netTradeIn, totalDown } from "../lib/intent.js";
import { isValidMobile, normalizeMobile, validateContact } from "../lib/contact.js";
import { TEST_DRIVE_SLOTS, validateTestDriveBooking } from "../lib/testDrive.js";
import { budgetStretchOffer, budgetThirdCarOffer, roundStretchExtra } from "../lib/budgetStretch.js";
import { saveRerunSeed, loadRerunSeed, clearRerunSeed } from "../lib/rerun.js";
import { MEMO_DISCLAIMERS } from "../lib/memoDetail.js";
import {
  memoHeadline,
  picksSectionTitle,
  testDriveTitle,
  thesePicks,
  whatsAppFooter,
} from "../lib/copy.js";

function answers(overrides = {}) {
  return {
    city: "bengaluru",
    household: "solo",
    commuteKm: 15,
    badRoads: false,
    parking: "apartment",
    charger: false,
    monthlyCap: 32000,
    keepYears: 5,
    hardNos: [],
    ...overrides,
  };
}

test("No EV without charger", () => {
  const a = answers({ charger: false });
  const ev = getCar("nexon-ev");
  const v = verdict(ev, a);
  assert.equal(v.code, "already_no");
  assert.match(v.reasons[0], /EV without a home charger/);

  const withPlug = verdict(ev, answers({ charger: true, monthlyCap: 40000 }));
  assert.notEqual(withPlug.reasons[0] || "", "Already no: EV without a home charger");
  assert.ok(withPlug.code !== "already_no" || !withPlug.reasons.some((r) => /charger/.test(r)));
});

test("family safety: kids reject sub-4-star, accept 5-star Punch", () => {
  const a = answers({ household: "kids" });
  const swift = verdict(getCar("swift"), a);
  assert.equal(swift.code, "already_no");
  assert.match(swift.reasons.join(" "), /4-star/);

  const punch = verdict(getCar("punch"), a);
  assert.ok(!punch.reasons.some((r) => /4-star/.test(r)));
});

test("safety floor is 4 stars for kids and third row", () => {
  assert.equal(SAFETY_FLOOR, 4);
  const kids = answers({ household: "kids" });
  const third = answers({ household: "third_row", monthlyCap: 60000 });
  assert.equal(verdict(getCar("seltos"), kids).code, "already_no");
  assert.equal(verdict(getCar("hyryder-hybrid"), kids).code, "already_no");
  assert.equal(getCar("seltos").safety < SAFETY_FLOOR, true);
  const { reasons } = hardPenalty(getCar("carens"), third, { total: 0 });
  assert.match(reasons.join(" "), /4-star|third row/);
});

test("path new vs used: CPO only on a tight cap, unless must_new", () => {
  const roomy = answers({ monthlyCap: 45000 });
  assert.equal(ownershipPath(roomy), "new");
  assert.equal(verdict(getCar("cpo-nexon"), roomy).code, "already_no");
  assert.match(verdict(getCar("cpo-nexon"), roomy).reasons.join(" "), /used\/CPO|must be new/);

  const tight = answers({ monthlyCap: TIGHT_CAP, household: "solo" });
  assert.equal(ownershipPath(tight), "used_ok");
  const used = verdict(getCar("cpo-nexon"), tight);
  assert.ok(
    used.code !== "already_no" || !used.reasons.some((r) => /used\/CPO only/.test(r)),
    "tight cap should allow the CPO path"
  );

  const forcedNew = answers({ monthlyCap: TIGHT_CAP, hardNos: ["must_new"] });
  assert.equal(ownershipPath(forcedNew), "new");
  assert.match(verdict(getCar("cpo-nexon"), forcedNew).reasons.join(" "), /must be new/);
});

test("verdicts: hard nos, Creta over cap, diesel ban, no-EV even with charger", () => {
  const over = answers({ monthlyCap: 18000, parking: "street" });
  const creta = verdict(getCar("creta"), over);
  assert.equal(creta.code, "already_no");

  const noDiesel = answers({ hardNos: ["no_diesel"], monthlyCap: 60000, household: "third_row" });
  const xuv = verdict(getCar("xuv700"), noDiesel);
  assert.equal(xuv.code, "already_no");
  assert.match(xuv.reasons.join(" "), /diesel/);

  const noEv = answers({ charger: true, hardNos: ["no_ev"], monthlyCap: 40000 });
  const ev = verdict(getCar("punch-ev"), noEv);
  assert.equal(ev.code, "already_no");
  assert.match(ev.reasons.join(" "), /ruled out EV/);

  const fit = verdict(getCar("tiago"), answers({ monthlyCap: 40000, household: "couple" }));
  assert.ok(["fit", "stretch"].includes(fit.code));
});

test("pick rank labels map to three tiers", () => {
  assert.equal(pickRankLabel(1), "Strongly Recommended");
  assert.equal(pickRankLabel(2), "Recommended");
  assert.equal(pickRankLabel(3), "Worth Considering");
});

test("CIBIL rate moves EMI vs 700 Good benchmark", () => {
  const finance = { onRoad: 1380000, condition: "new", insurance: 3450, fuel: 1513, service: 1100 };
  const good = financeForCibil(finance, 700);
  const low = financeForCibil(finance, 580);
  const high = financeForCibil(finance, 780);
  assert.ok(high.emi < good.emi);
  assert.ok(low.emi > good.emi);
  assert.equal(good.emiDeltaVsGood, 0);
});

test("commute card fuel scales with km and pick", () => {
  const a = answers({ commuteKm: 20, household: "kids", monthlyCap: 35000 });
  const result = scoreCatalog(a);
  const memo = buildMemo(a, result);
  const commute = buildCommuteSummary(a, memo.picks);
  assert.equal(commute.dailyKm, 20);
  assert.equal(commute.kmMonth, 520);
  assert.ok(commute.rows.length <= 3);
  assert.ok(commute.rows[0].yearlyFuel === commute.rows[0].monthlyFuel * 12);
});

test("intent down payment lowers EMI vs 20% baseline", () => {
  const finance = { onRoad: 1380000, condition: "new", insurance: 3450, fuel: 1513, service: 1100 };
  const baseline = financeForIntent(finance, { tradeIn: "none", cashDown: 276000, exchangeValue: 0, emiLeft: 0 });
  const bigger = financeForIntent(finance, { tradeIn: "none", cashDown: 500000, exchangeValue: 0, emiLeft: 0 });
  assert.ok(bigger.emi < baseline.emi);
  assert.equal(netTradeIn({ tradeIn: "emi", exchangeValue: 400000, emiLeft: 100000 }), 300000);
  assert.ok(totalDown({ onRoad: 1380000, condition: "new", cashDown: 200000, tradeIn: "owned", exchangeValue: 300000 }) >= 1380000 * 0.1);
});

test("contact: Indian mobile is 10 digits, no +91", () => {
  assert.equal(normalizeMobile("+91 98765 43210"), "9876543210");
  assert.equal(normalizeMobile("919876543210"), "9876543210");
  assert.ok(isValidMobile("9876543210"));
  assert.ok(!isValidMobile("5876543210"));
  assert.equal(validateContact({ name: "A", mobile: "9876543210" }), "Enter your name (at least 2 characters).");
  assert.equal(validateContact({ name: "Aditya", mobile: "987654321" }), "Enter a 10-digit mobile number (no +91).");
  assert.equal(validateContact({ name: "Aditya", mobile: "9876543210" }), null);
});

test("shortlist never exceeds all-in monthly cap", () => {
  const a = answers({ household: "kids", monthlyCap: 25000, commuteKm: 20 });
  const result = scoreCatalog(a);
  for (const row of result.shortlist) {
    assert.ok(row.allIn.total <= 25000, `${row.carId} is ${row.allIn.total}, over 25000 cap`);
  }
});

test("empty shortlist when nothing fits the cap", () => {
  const a = answers({ household: "kids", monthlyCap: 15000, commuteKm: 20 });
  const result = scoreCatalog(a);
  assert.equal(result.shortlist.length, 0);
  const memo = buildMemo(a, result);
  assert.equal(memo.picks.length, 0);
  assert.ok(memo.emptyReason);
});

test("budget stretch rounds extra to nearest 1000, min 1000", () => {
  assert.equal(roundStretchExtra(1), 1000);
  assert.equal(roundStretchExtra(999), 1000);
  assert.equal(roundStretchExtra(1001), 2000);
  assert.equal(roundStretchExtra(2500), 3000);
});

test("budget stretch offer when cap is too tight", () => {
  const a = answers({ household: "kids", monthlyCap: 15000, commuteKm: 20 });
  const offer = budgetStretchOffer(a);
  assert.ok(offer);
  assert.ok(offer.extraMonthly >= 1000);
  assert.equal(offer.extraMonthly % 1000, 0);
  assert.ok(offer.newCap > a.monthlyCap);
  const stretched = scoreCatalog({ ...a, monthlyCap: offer.newCap });
  assert.ok(stretched.shortlist.length >= 1);
});

test("third car nudge when two in-budget picks", () => {
  const base = {
    city: "delhi",
    household: "kids",
    commuteKm: 12,
    badRoads: false,
    parking: "apartment",
    charger: false,
    monthlyCap: 18000,
    keepYears: 5,
    hardNos: ["must_new"],
  };
  const atCap = scoreCatalog(base);
  assert.equal(atCap.shortlist.length, 2);

  const offer = budgetThirdCarOffer(base);
  assert.ok(offer);
  assert.equal(offer.tier, "third");
  assert.equal(offer.currentCount, 2);
  assert.ok(offer.extraMonthly >= 1000);
  assert.equal(offer.extraMonthly % 1000, 0);
  assert.ok(offer.newCarNames.length >= 1);

  const after = scoreCatalog({ ...base, monthlyCap: offer.newCap });
  assert.equal(after.shortlist.length, 3);
});

test("second budget stretch uses real extra to reach three picks", () => {
  const base = {
    city: "delhi",
    household: "kids",
    commuteKm: 12,
    badRoads: false,
    parking: "apartment",
    charger: false,
    monthlyCap: 14000,
    keepYears: 5,
    hardNos: ["must_new"],
  };
  const first = budgetStretchOffer(base);
  assert.ok(first);
  const afterFirst = scoreCatalog({ ...base, monthlyCap: first.newCap });
  assert.equal(afterFirst.shortlist.length, 1);

  const second = budgetThirdCarOffer({ ...base, monthlyCap: first.newCap }, { firstStretchExtra: first.extraMonthly });
  assert.ok(second);
  assert.ok(second.rawExtra >= 1000, "second stretch should be honest thousands, not fake 3k");
  assert.equal(second.extraMonthly % 1000, 0);
  assert.ok(second.newCarNames.length >= 1);
  const afterSecond = scoreCatalog({ ...base, monthlyCap: second.newCap });
  assert.equal(afterSecond.shortlist.length, 3);
});

test("count-aware copy matches pick count", () => {
  assert.match(memoHeadline({ count: 0, city: "Mumbai", household: "Kids", monthlyCap: "₹25,000 all-in cap" }), /Nothing in this cap/);
  assert.match(memoHeadline({ count: 1, city: "Mumbai", household: "Kids", monthlyCap: "₹25,000 all-in cap" }), /One car\. Then stop shopping/);
  assert.match(memoHeadline({ count: 2, city: "Mumbai", household: "Kids", monthlyCap: "₹25,000 all-in cap" }), /Two cars/);
  assert.match(memoHeadline({ count: 3, city: "Mumbai", household: "Kids", monthlyCap: "₹25,000 all-in cap" }), /Three cars/);
  assert.equal(picksSectionTitle(1), "Your one pick");
  assert.equal(thesePicks(1), "this one");
  assert.equal(thesePicks(2), "these two");
  assert.equal(testDriveTitle(1), "This one is still a rumour.");
  assert.match(whatsAppFooter(2), /two cars/);
});

test("scoreCatalog still returns at most 3 cars and a used/new path", () => {
  const a = answers({ household: "kids", monthlyCap: 25000, commuteKm: 12, charger: false });
  const result = scoreCatalog(a);
  assert.ok(result.shortlist.length <= 3);
  assert.equal(result.path, "new");
  for (const row of result.shortlist) {
    const car = getCar(row.carId);
    assert.ok(car.safety >= SAFETY_FLOOR);
    assert.ok(row.allIn.total <= a.monthlyCap);
    assert.notEqual(car.fuel, "ev");
    assert.notEqual(car.condition, "cpo");
  }
});

test("selection memo and denied-in-cap list", () => {
  const a = answers({ household: "kids", monthlyCap: 32000, commuteKm: 12, city: "delhi", hardNos: ["must_new"] });
  const result = scoreCatalog(a);
  assert.ok(result.shortlist.length >= 2);
  const memo = buildMemo(a, result);
  assert.ok(memo.selectionMemo);
  assert.ok(memo.selectionMemo.methodology.length >= 3);
  assert.equal(memo.selectionMemo.pickSummaries.length, memo.picks.length);
  assert.ok(Array.isArray(memo.deniedInCap));
  assert.ok(memo.disclaimers.length >= 3);
  assert.match(memo.disclaimers.join(" "), /CIBIL|credit score/i);
  assert.match(memo.disclaimers.join(" "), /estimate|not a final/i);
  if (memo.deniedInCap.length) {
    assert.ok(memo.deniedInCap[0].reason);
    assert.ok(memo.deniedInCap[0].allIn);
  }
});

test("rerun seed keeps full interview answers including city", () => {
  const store = new Map();
  const mockStorage = {
    setItem(k, v) {
      store.set(k, v);
    },
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    removeItem(k) {
      store.delete(k);
    },
  };
  const prev = globalThis.localStorage;
  globalThis.localStorage = mockStorage;

  try {
    const seeded = answers({
      city: "delhi",
      household: "kids",
      commuteKm: 12,
      badRoads: true,
      parking: "house",
      charger: false,
      monthlyCap: 32000,
      keepYears: 8,
      hardNos: ["must_new"],
    });
    saveRerunSeed(seeded);
    const loaded = loadRerunSeed();
    assert.ok(loaded);
    assert.equal(loaded.answers.city, "delhi");
    assert.equal(loaded.answers.household, "kids");
    assert.equal(loaded.answers.commuteKm, 12);
    assert.equal(loaded.answers.badRoads, true);
    assert.equal(loaded.answers.monthlyCap, 32000);
    assert.equal(loaded.answers.hardNos.join(","), "must_new");
    clearRerunSeed();
    assert.equal(loadRerunSeed(), null);
  } finally {
    if (prev === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = prev;
  }
});

test("test drive slots are hourly from 10 AM to 6 PM", () => {
  assert.equal(TEST_DRIVE_SLOTS.length, 8);
  assert.equal(TEST_DRIVE_SLOTS[0].value, "10:00");
  assert.equal(TEST_DRIVE_SLOTS[7].value, "17:00");
  assert.equal(
    validateTestDriveBooking({ name: "Aditya", mobile: "9876543210", date: "2020-01-01", slot: "10:00" }),
    "Choose today or a future date."
  );
  assert.equal(
    validateTestDriveBooking({ name: "Aditya", mobile: "9876543210", date: "2099-06-01", slot: "" }),
    "Pick a one-hour slot (10 AM – 6 PM)."
  );
});
