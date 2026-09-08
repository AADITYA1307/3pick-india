# How we got here

Honest log of prompts and course corrections while building **3 Pick India** in Cursor. Times are IST, 8 Sep 2026.

---

## 1. Original brief (~2:50 PM)

> Take-home: confused buyer → shortlist of ≤3 cars. Look at US market patterns. Full stack, `npm install && npm run dev` in &lt;2 min, no Docker/env, 2–3 hour time box. **Do not** build catalog/marketplace/chatbot/dealer inventory. **Do** build: 7-question life interview, score in code (not LLM), save result, shortlist page + shareable memo.

**Built first:** US-flavoured **CarBrief** — 7 questions, deterministic scoring, JSON persistence, shortlist + memo.

---

## 2. India pivot (~3:09 PM)

> Pivot to India. On-road ₹, all-in monthly (EMI + insurance + fuel + service), new default, CPO only on tight cap, no EV without charger, 4★ floor for family, CNG only in Delhi/Mumbai/Pune, ~30 real models.

**Changed:** Renamed catalog to Indian models, rewrote `lib/score.js` penalties, city list, all-in cost math. Kept US flow as reference only.

---

## 3. Interview spec (~3:18 PM)

> Exact 7 life questions (no name/mobile/CIBIL). POST `/api/shortlist`, GET `/api/shortlist/:id`, JSON file. Tests for EV, family safety, new vs used, verdicts.

**Changed:** Question copy in `lib/questions.js`, validation, test suite in `tests/rules.test.mjs`.

---

## 4. Small UX tweaks (~3:24–3:32 PM)

- **Host locally** — dev server only, no deploy.
- **City pills on home** — city moved off interview step 1 to home page.
- **Branding** — **3 Pick India** (accent on **3**), dropped CarBrief name.
- **Header** — removed nav links (Interview / Catalog / Scoring); added **Decision Memo** box on the right.

---

## 5. Home page copy (~3:34 PM)

> Remove long “CarWale/CarDekho/Spinny” paragraph; replace with shorter, more engaging hero.

**Changed:** Simpler hero on `app/page.js`.

---

## 6. Major course correction (~3:38 PM) ⚠️

> **Not a CarDekho clone.** Looked too much like their site. No filter grid, no browse catalog, no variant picker. Keep only: interview → ≤3 cars → defendable memo. Last page is a **Decision Memo**, not a listing site. Put **CarDekho logo** on every page; white header so logo is visible.

**Cut:** `app/catalog/page.js`, `app/method/page.js`, market grid on home, score bars, listing-style shortlist.

**Kept:** Interview → `/m/:id` memo only. `/shortlist/:id` redirects to memo.

**Added:** `SiteHeader.js` with CarDekho logo + 3 Pick India.

---

## 7. Header polish (~3:41 PM)

> Logo larger and clear. **3 Pick India** separate from CarDekho (divider + distinct wordmark) to avoid brand conflict.

**Changed:** Bigger logo (56px), vertical divider, separate typography for product name.

---

## 8. Rich car cards (~3:44 PM)

> Cards must show more than EMI. Rank every pick: **Strongly Recommended / Recommended / Worth Considering**. Also: India sales (FY26 style), colours, OEM, ARAI mileage, service interval. Buyer should see *why*, not only EMI.

**Added:** `lib/carSpecs.js`, `app/CarPickCard.js`, rank labels in `buildMemo()`, memo rebuild for older saved records.

---

## 9. Evaluator docs (~3:49 PM)

> README for evaluator + this file.

---

## 10. Memo depth + budget nudges (~4:00–4:30 PM)

> Full scoring memo, “in cap but denied”, skipped cars, footer disclaimers. Budget stretch modal when 1–2 cars fit cap. Third-car nudge. Rerun interview with city preserved.

**Added:** `buildSelectionMemo`, `buildDeniedInCap`, `BudgetStretchModal`, `lib/rerun.js`, home rule pills.

---

## 11. Tabbed memo UX (~4:45–5:15 PM)

> Replace long scroll with tabs: **Your Picks**, **Buying Intent**, **Full Memo**. Move WhatsApp to **Share & next**. Full Memo uses compact pills + popup for picks, denied-in-cap, and skipped cars. Interview answers in a styled summary card. Per-car **Book test drive** with booking page (name, mobile, date, hourly slots 10 AM–6 PM).

**Added:** `MemoTabs`, `MemoCompareTable`, `MemoDetailSection` (pills + modal), `InterviewSummaryCard`, `TestDriveBookingClient`, test-drive API. Removed redundant aggregate test-drive card from Your Picks tab.

**Polish:** Tab labels capitalised (Your Picks, Buying Intent, Full Memo). Removed memo header metadata line (date/ref/scored-in-code).

---

## What we learned

1. **First draft looked like a listing site** — easy trap when the domain is cars. Evaluators care about the *decision* product, not another browse UI.
2. **India rules belong in code, not copy** — on-road, all-in monthly, CNG geography, and safety floor are testable in `lib/score.js`.
3. **AI speed vs product judgment** — AI shipped fast; human prompts had to repeatedly say “cut the catalog” and “this is a memo, not CarDekho.”

---

## Current shape (end state)

```
Home (city pills) → Interview (7 Qs, city from URL) → POST /api/shortlist → Decision Memo /m/:id
```

**Decision Memo tabs:** Your Picks · Buying Intent · Full Memo · Share & next (below tabs).

Three rich car cards with per-car test drive booking. Compact Full Memo with pill popups. CarDekho logo in header; **3 Pick India** as separate product name. 21 unit tests.
