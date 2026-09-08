"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BudgetStretchModal from "./BudgetStretchModal";
import CarPickCard from "./CarPickCard";
import CibilCard from "./CibilCard";
import CommuteCard from "./CommuteCard";
import ContactCard from "./ContactCard";
import InterviewSummaryCard from "./InterviewSummaryCard";
import IntentCard from "./IntentCard";
import MemoCompareTable from "./MemoCompareTable";
import MemoDetailSection from "./MemoDetailSection";
import MemoDisclaimers from "./MemoDisclaimers";
import MemoShareNext from "./MemoShareNext";
import MemoTabs from "./MemoTabs";
import { budgetStretchOffer, budgetThirdCarOffer } from "../lib/budgetStretch.js";
import { buildCommuteSummary } from "../lib/commute.js";
import { picksSectionTitle } from "../lib/copy.js";
import { buildMemo, labelAnswers, scoreCatalog } from "../lib/score.js";
import { formatMoney } from "../lib/cars.js";
import { saveRerunSeed } from "../lib/rerun.js";

export default function MemoClient({ record }) {
  const router = useRouter();
  const baseAnswers = record.answers;
  const baseCap = Number(baseAnswers.monthlyCap);
  const [monthlyCap, setMonthlyCap] = useState(baseCap);
  const [stretchDismissed, setStretchDismissed] = useState(false);
  const [stretchAccepted, setStretchAccepted] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [thirdNudgeDismissed, setThirdNudgeDismissed] = useState(false);
  const [thirdNudgeAccepted, setThirdNudgeAccepted] = useState(false);
  const [thirdAcceptedOffer, setThirdAcceptedOffer] = useState(null);
  const [tab, setTab] = useState("picks");

  const answers = useMemo(() => ({ ...baseAnswers, monthlyCap }), [baseAnswers, monthlyCap]);

  const result = useMemo(() => scoreCatalog(answers), [answers]);
  const m = useMemo(() => buildMemo(answers, result), [answers, result]);
  const commute = m.picks.length ? buildCommuteSummary(answers, m.picks) : null;
  const pickCount = m.picks.length;

  const stretchOffer = useMemo(() => {
    if (stretchAccepted || stretchDismissed || pickCount > 0) return null;
    return budgetStretchOffer(baseAnswers);
  }, [baseAnswers, stretchAccepted, stretchDismissed, pickCount]);

  const thirdCarOffer = useMemo(() => {
    if (thirdNudgeDismissed || thirdNudgeAccepted || pickCount === 0 || pickCount >= 3) return null;
    return budgetThirdCarOffer(answers, {
      firstStretchExtra: stretchAccepted && acceptedOffer ? acceptedOffer.extraMonthly : 0,
    });
  }, [answers, thirdNudgeDismissed, thirdNudgeAccepted, pickCount, stretchAccepted, acceptedOffer]);

  const interviewDisplay = useMemo(
    () => (stretchAccepted || thirdNudgeAccepted ? m.interview : labelAnswers({ ...baseAnswers, monthlyCap: baseCap })),
    [stretchAccepted, thirdNudgeAccepted, m.interview, baseAnswers, baseCap]
  );

  const showFirstStretch = Boolean(stretchOffer) && !stretchDismissed && !stretchAccepted;
  const showThirdNudge = Boolean(thirdCarOffer) && !thirdNudgeDismissed && !thirdNudgeAccepted;
  const activeStretch = showThirdNudge ? thirdCarOffer : showFirstStretch ? stretchOffer : null;

  function acceptStretch() {
    if (showThirdNudge && thirdCarOffer) {
      setThirdAcceptedOffer(thirdCarOffer);
      setMonthlyCap(thirdCarOffer.newCap);
      setThirdNudgeAccepted(true);
      return;
    }
    if (!stretchOffer) return;
    setAcceptedOffer(stretchOffer);
    setMonthlyCap(stretchOffer.newCap);
    setStretchAccepted(true);
  }

  function declineStretch() {
    if (showThirdNudge) {
      setThirdNudgeDismissed(true);
      return;
    }
    setStretchDismissed(true);
    setMonthlyCap(baseCap);
  }

  function stretchBanner() {
    if (thirdNudgeAccepted && thirdAcceptedOffer) {
      const parts = [];
      if (stretchAccepted && acceptedOffer) parts.push(formatMoney(acceptedOffer.extraMonthly));
      parts.push(thirdAcceptedOffer.extraLabel);
      const totalExtra = (stretchAccepted && acceptedOffer ? acceptedOffer.extraMonthly : 0) + thirdAcceptedOffer.extraMonthly;
      return `Showing three options at ${thirdAcceptedOffer.newCapLabel}/month all-in (+${formatMoney(totalExtra)} total top-up).`;
    }
    if (stretchAccepted && acceptedOffer) {
      return `Showing options at ${acceptedOffer.newCapLabel}/month all-in (you added ${acceptedOffer.extraLabel}/month).`;
    }
    return null;
  }

  const banner = stretchBanner();

  const activeTab = tab === "intent" && pickCount === 0 ? "picks" : tab;
  const tabs = [
    { id: "picks", label: pickCount === 1 ? "Your Pick" : "Your Picks" },
    { id: "intent", label: "Buying Intent", disabled: pickCount === 0 },
    { id: "memo", label: "Full Memo" },
  ];

  function changeTab(id) {
    setTab(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function runAgain() {
    saveRerunSeed(baseAnswers);
    router.push(`/interview?city=${baseAnswers.city}&rerun=1`);
  }

  return (
    <>
      <article className="memo memo--decision">
        <header className="memo-head">
          <p className="memo-kicker sans">Decision Memo</p>
          <h1 className="memo-title">{m.headline}</h1>
          {banner ? <p className="fine sans budget-stretch-banner">{banner}</p> : null}
        </header>

        <MemoTabs tabs={tabs} active={activeTab} onChange={changeTab} />

        <div
          id="memo-panel-picks"
          role="tabpanel"
          aria-labelledby="memo-tab-picks"
          hidden={activeTab !== "picks"}
          className="memo-panel"
        >
          <section className="memo-section">
            <InterviewSummaryCard interview={interviewDisplay} />
          </section>

          <section className="memo-section">
            <h2>{picksSectionTitle(pickCount)}</h2>
            {pickCount > 0 ? (
              m.picks.map((p) => <CarPickCard pick={p} memoId={record.id} key={`${p.rank}-${p.name}`} />)
            ) : (
              <div className="memo-empty sans">
                <p>{m.emptyReason}</p>
                {stretchDismissed ? (
                  <Link className="btn secondary" href="/">
                    Back to home
                  </Link>
                ) : (
                  <p className="fine">Hang on — we may have a way to stretch the budget.</p>
                )}
              </div>
            )}
          </section>

          <section className="memo-section">
            <ContactCard memoId={record.id} initialContact={record.contact} pickCount={pickCount} />
          </section>

          <section className="memo-section">
            <h2>Defend this at the dealer</h2>
            <p>{m.nextStep}</p>
          </section>

          <p className="fine sans memo-tab-hint">
            Estimates only — not a dealer quote. EMI moves with CIBIL. See Buying Intent and Full Memo for the
            rest.
          </p>
        </div>

        {pickCount > 0 ? (
          <div
            id="memo-panel-intent"
            role="tabpanel"
            aria-labelledby="memo-tab-intent"
            hidden={activeTab !== "intent"}
            className="memo-panel"
          >
            <MemoCompareTable picks={m.picks} />
            <section className="memo-section">
              <CommuteCard commute={commute} />
            </section>
            <section className="memo-section">
              <CibilCard picks={m.picks} />
            </section>
            <section className="memo-section">
              <IntentCard picks={m.picks} />
            </section>
          </div>
        ) : null}

        <div
          id="memo-panel-memo"
          role="tabpanel"
          aria-labelledby="memo-tab-memo"
          hidden={activeTab !== "memo"}
          className="memo-panel"
        >
          <MemoDetailSection
            selectionMemo={m.selectionMemo}
            deniedInCap={m.deniedInCap}
            skipped={m.skipped}
            picks={m.picks}
            pickCount={pickCount}
          />

          <MemoDisclaimers items={m.disclaimers} />
        </div>

        <MemoShareNext
          headline={m.headline}
          picks={m.picks}
          memoId={record.id}
          pickCount={pickCount}
          onRunAgain={runAgain}
        />
      </article>

      <BudgetStretchModal open={Boolean(activeStretch)} offer={activeStretch} onYes={acceptStretch} onNo={declineStretch} />
    </>
  );
}
