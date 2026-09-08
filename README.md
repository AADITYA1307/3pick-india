# 3 Pick India — evaluator README

**Not a listing site.** Short life interview → up to 3 cars → **Decision Memo** you can defend.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No Docker, no `.env`.

```bash
npm test   # 21 rule tests in tests/rules.test.mjs
```

**Demo flow:** pick a city on home → complete the interview → land on `/m/:id` (Decision Memo). Use the three tabs, book a test drive from any pick card, and try Share & next at the bottom.

---

## What did you build and why?

**3 Pick India** helps a confused Indian car buyer get from “I don’t know what to buy” to a **defensible shortlist of at most three cars**.

The product bet: sites like CarDekho, CarWale, and Spinny are great **after** you know the model. Their finders still ask for body type and brand — the thing you’re confused about. US products (Edmunds, KBB-style flows) interview **life constraints** first. This app copies that idea and translates it for India:

- **On-road ₹**, not ex-showroom
- **All-in monthly** = EMI + insurance + fuel + service (buyer’s cap is on this number)
- **New by default**; used/CPO only when the cap is tight
- **No EV** without a home charger
- **4★ safety floor** when kids ride
- **CNG** only where the network exists (Delhi-NCR, Mumbai, Pune)

**Flow:** city pills on home → 7-step life interview → **Decision Memo** (`/m/:id`). Scoring is deterministic code in `lib/score.js`, not an LLM.

**Decision Memo (final page)** is split into three tabs to reduce scroll:

| Tab | What it shows |
|-----|----------------|
| **Your Picks** | Interview summary card, ranked car cards with **Book test drive**, contact details, dealer defense copy |
| **Buying Intent** | Side-by-side compare table, commute running cost, CIBIL EMI sensitivity, down-payment / trade-in intent |
| **Full Memo** | Methodology, compact car **pills** (tap for score + reasons popup), denied-in-cap list, skipped cars, disclaimers |

Other notable features:

- **Budget stretch modals** — honest nudge when cap is tight (1–2 picks) to reach three
- **Rerun interview** — “Run it again” keeps city + seeds all prior answers
- **Test drive booking** — per-car `/m/:id/test-drive/:carId` with name, mobile, date, and hourly slots (10 AM–6 PM)
- **Share & next** — WhatsApp share + rerun / start over (always visible below tabs)
- **CarDekho-adjacent branding** — Lato, orange accent, logo in header; product name stays **3 Pick India**

---

## What did you deliberately cut?

| Cut | Why |
|-----|-----|
| Catalog browse, filter grid, variant picker | Would duplicate CarDekho; assignment is decision support, not inventory |
| Chatbot / LLM scoring | Hard to defend; rules must be testable |
| Dealer inventory, marketplace, lease | Out of scope; no real dealer APIs |
| CIBIL / buy-when / exchange in the interview | Kept off the life interview; CIBIL and intent live on the memo only |
| Every trim of every model | ~30 volume variants is enough for a take-home |
| Live price feeds | Static illustrative on-road numbers |
| Auth, DB, Docker, env files | Must run in under 2 minutes with `npm install && npm run dev` |
| PDF export, email share | Time box |
| Real dealer CRM / SMS for test drives | Bookings saved locally on the memo record only |

The old `/shortlist/:id` page redirects to the memo. There is no second “results listing” view.

---

## Tech stack and why

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 14** (App Router) | Full stack in one repo: pages + API routes + shareable URLs |
| UI | **React 18**, plain CSS | No component library — faster to ship, fewer deps |
| Scoring | **Node modules** (`lib/score.js`) | Transparent, unit-testable rules |
| Data | **JSON file** (`data/shortlists.json`) | No DB setup; good enough for a demo |
| Tests | **Node built-in test runner** | Zero extra test dependencies |
| APIs | `POST /api/shortlist`, contact PATCH, test-drive POST | Simple REST; memo link is shareable |

No TypeScript — speed over ceremony for a time-boxed take-home.

---

## What did you delegate to AI vs do yourself?

**Human (product owner in Cursor):**

- Assignment framing and India-specific rules (on-road, all-in monthly, CNG cities, safety floor)
- Course corrections when the UI drifted toward a CarDekho clone
- Branding: **3 Pick India**, CarDekho logo placement, Decision Memo box, tab naming
- Interview question set and what *not* to ask in the life interview
- Rich card requirements (rank labels, FY26 sales, OEM, ARAI, service interval)
- Memo UX direction: tabs over long scroll, pills + popup on Full Memo, test drive per pick, Share & next placement

**AI (Cursor agent):**

- Initial scaffold, ~30-car catalog, scoring engine, diversification logic
- API routes, JSON persistence, interview UI, memo page and tab components
- Unit tests for hard rules (EV/charger, family safety, new vs used path, budget stretch, test-drive slots)
- CSS/layout iterations after each correction
- `lib/carSpecs.js`, `CarPickCard`, compare/CIBIL/intent cards, test-drive booking flow

**Where AI helped most:** scaffolding, repetitive UI components, test boilerplate, CSS polish.

**Where AI got in the way:** first drafts looked like a listing site; needed repeated “cut the catalog” / “this is a memo” prompts. Tab vs accordion trade-offs needed explicit product direction.

**Honest caveat:** Most lines of code were AI-generated and then steered by prompts. Scoring weights and India rules were specified up front; not tuned against real buyer data. FY26 sales and on-road prices are **illustrative**, not live.

---

## If you had another 4 hours?

1. **Deploy to Vercel** with a note about ephemeral JSON storage, or swap to a hosted KV/DB
2. **PDF / print-quality memo export** — something a buyer can WhatsApp to family
3. **Integration tests** — full interview → API → memo page with snapshot assertions
4. **Real test-drive handoff** — webhook or email to a dealer CRM when a slot is booked
5. **Sensitivity copy** — “If your commute is +5 km/day, all-in rises by ₹X” on each card

---

## Project map

```
app/page.js                          Home + city pills + rule pills
app/interview/page.js                Life interview (7 questions)
app/m/[id]/page.js                   Decision Memo (tabbed)
app/m/[id]/test-drive/[carId]/page.js   Test drive booking
app/MemoClient.js                    Memo tabs + panels
app/CarPickCard.js                   Ranked pick cards + test drive CTA
app/InterviewSummaryCard.js          “What you told us” summary box
app/MemoDetailSection.js             Full Memo pills + detail modal
app/MemoShareNext.js                 WhatsApp + rerun actions
lib/score.js                         Scoring + memo builder
lib/testDrive.js                     Slot validation (10 AM–6 PM)
lib/budgetStretch.js                 Cap stretch + third-car nudge
lib/cars.js                          ~30 Indian models
lib/carSpecs.js                      Card facts (sales, colours, OEM, service)
lib/questions.js                     Interview + validation
tests/rules.test.mjs                 21 unit tests
data/shortlists.json                 Saved results (gitignored)
```

See [HOW-WE-GOT-HERE.md](./HOW-WE-GOT-HERE.md) for the prompt log and course corrections.
