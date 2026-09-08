import { whatsAppFooter } from "./copy.js";

/** Family-friendly WhatsApp text — no phone number, ever. */
export function buildWhatsAppMessage({ headline, picks, memoUrl }) {
  const lines = [
    "3 Pick India — Decision Memo",
    "",
    headline,
    "",
    ...picks.map(
      (p) =>
        `${p.rank}. ${p.rankLabel}\n${p.name}\n${p.allIn}/mo all-in · ${p.onRoad} on-road · ${p.safety}`
    ),
    "",
    `Full memo: ${memoUrl}`,
    "",
    whatsAppFooter(picks.length),
  ];
  return lines.join("\n");
}

export function whatsAppShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
