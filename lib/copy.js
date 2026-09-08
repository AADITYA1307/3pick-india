/** Count-aware memo copy. Max 3 picks; always match what is on screen. */

export function pickCount(n) {
  return Math.max(0, Math.min(3, Number(n) || 0));
}

export function memoHeadline({ count, city, household, monthlyCap }) {
  const ctx = `${city}, ${household.toLowerCase()}, ${monthlyCap}`;
  if (count === 0) return `Nothing in this cap — ${ctx}`;
  if (count === 1) return `One car. Then stop shopping — ${ctx}`;
  if (count === 2) return `Two cars — ${ctx}`;
  return `Three cars — ${ctx}`;
}

export function picksSectionTitle(count) {
  const n = pickCount(count);
  if (n === 0) return "Your shortlist";
  if (n === 1) return "Your one pick";
  if (n === 2) return "Your two picks";
  return "Your three picks";
}

export function thesePicks(count) {
  const n = pickCount(count);
  if (n === 1) return "this one";
  if (n === 2) return "these two";
  if (n === 0) return "these";
  return "these three";
}

export function testDriveTitle(count) {
  return pickCount(count) === 1 ? "This one is still a rumour." : "Until you sit in it, the car is still a rumour.";
}

export function testDriveLead(count) {
  const ref = thesePicks(count);
  return `Brochures and reels are not your speed breakers, your society gate, or your child's car seat. Get ${ref} brought home this weekend — same parking, same passengers, no half-day at a dealership.`;
}

export function whatsAppLead(count) {
  const n = pickCount(count);
  if (n === 1) return "Share your one pick so family can weigh in.";
  if (n === 2) return "Share your two picks so family can weigh in.";
  return "Share your three picks so family can weigh in.";
}

export function contactLead(count) {
  const ref = thesePicks(count);
  return `Saved only on this memo — not asked in the life interview. A dealer can reach you about ${ref}.`;
}

export function commuteLead(count) {
  const n = pickCount(count);
  if (n === 1) return "Fuel-only cost for your one pick — the number people forward when arguing petrol vs CNG vs EV.";
  if (n === 2) return "Fuel-only cost for these two — the number people forward when arguing petrol vs CNG vs EV.";
  return "Fuel-only cost for these three — the number people forward when arguing petrol vs CNG vs EV.";
}

export function cibilLead(count) {
  const ref = thesePicks(count);
  return `Curiosity tool only — we never pull a bureau file. Drag the slider to see how EMI shifts for ${ref}, compared against 700 (Good).`;
}

export function intentLead(count) {
  const ref = thesePicks(count);
  return `Not part of the life interview — answer when you are ready. EMI below recalculates for ${ref} as your cash and exchange change.`;
}

export function dealerNextStep(count) {
  const ref = thesePicks(count);
  if (count === 1) {
    return "Ask the dealer for a written on-road quote (not ex-showroom). Recheck EMI + insurance + your real monthly kilometres. Test-drive this one. Take the actual passengers.";
  }
  return `Ask each dealer for a written on-road quote (not ex-showroom). Recheck EMI + insurance + your real monthly kilometres. Test-drive ${ref}. Take the actual passengers.`;
}

export function whatsAppFooter(count) {
  const n = pickCount(count);
  if (n === 1) return "From a short life interview — one car, scored in code.";
  if (n === 2) return "From a short life interview — two cars, scored in code.";
  if (n === 3) return "From a short life interview — three cars, scored in code.";
  return "From a short life interview — scored in code.";
}

export function emptyCapReason(monthlyCap) {
  return `Nothing in this catalog fits ${monthlyCap} all-in once EMI, insurance, fuel, and service are counted.`;
}

export function stretchOptionsPhrase(count) {
  const n = pickCount(count);
  if (n === 1) return "one option";
  if (n === 2) return "two options";
  return "one or two options";
}
