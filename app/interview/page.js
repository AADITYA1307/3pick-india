"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ExitDraftModal from "../ExitDraftModal";
import { QUESTIONS, CITIES, CITY_OPTIONS } from "../../lib/questions.js";
import { clearDraft, loadDraft, saveDraft } from "../../lib/draft.js";
import { clearRerunSeed, loadRerunSeed } from "../../lib/rerun.js";

function inr(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const INITIAL = {
  commuteKm: 20,
  badRoads: false,
  charger: false,
  monthlyCap: 28000,
  keepYears: 5,
  hardNos: [],
};

function InterviewFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityParam = searchParams.get("city") || "";
  const rerunParam = searchParams.get("rerun") === "1";
  const cityValid = Boolean(CITIES[cityParam]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ ...INITIAL, city: cityParam });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const draftLoaded = useRef(false);
  const allowLeave = useRef(false);
  const savedDraft = useMemo(() => loadDraft(), []);
  const q = QUESTIONS[step];

  useEffect(() => {
    if (!cityValid) router.replace("/");
  }, [cityValid, router]);

  useEffect(() => {
    if (!cityValid || draftLoaded.current) return;

    if (rerunParam) {
      const seed = loadRerunSeed();
      if (seed?.answers) {
        setAnswers({ ...INITIAL, ...seed.answers, city: seed.answers.city || cityParam });
        setStep(0);
      }
      draftLoaded.current = true;
      return;
    }

    const draft = loadDraft();
    if (draft && draft.city === cityParam) {
      setAnswers((a) => ({ ...a, ...draft.answers, city: cityParam }));
      setStep(Math.min(draft.step ?? 0, QUESTIONS.length - 1));
    }
    draftLoaded.current = true;
  }, [cityParam, cityValid, rerunParam]);

  const leaveInterview = useCallback((href) => {
    setPendingLeave(href);
    setShowExit(true);
  }, []);

  useEffect(() => {
    if (!cityValid || busy) return;

    function onBeforeUnload(e) {
      if (allowLeave.current || busy) return;
      e.preventDefault();
      e.returnValue = "";
    }

    function onClick(e) {
      const a = e.target.closest("a");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("/interview")) return;
      e.preventDefault();
      e.stopPropagation();
      leaveInterview(href);
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [cityValid, busy, leaveInterview]);

  useEffect(() => {
    if (!cityValid || busy) return;
    window.history.pushState({ interviewGuard: true }, "");
    function onPopState() {
      window.history.pushState({ interviewGuard: true }, "");
      leaveInterview("/");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [cityValid, busy, leaveInterview]);

  function stayOnPage() {
    setShowExit(false);
    setPendingLeave(null);
  }

  function saveAndLeave(contact) {
    setDraftSaving(true);
    saveDraft({
      name: contact.name,
      mobile: contact.mobile,
      city: answers.city || cityParam,
      step,
      answers: { ...answers, city: answers.city || cityParam },
    });
    setDraftSaving(false);
    setShowExit(false);
    allowLeave.current = true;
    const target = pendingLeave || "/";
    setPendingLeave(null);
    if (target === "back") window.history.go(-2);
    else router.push(target);
  }

  if (!cityValid) {
    return (
      <main>
        <p className="fine">Pick a city on the home page first.</p>
        <Link className="btn" href="/">
          Back home
        </Link>
      </main>
    );
  }

  async function finish(nextAnswers) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: nextAnswers }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Could not save shortlist");
      return;
    }
    clearDraft();
    clearRerunSeed();
    allowLeave.current = true;
    router.push(`/m/${data.id}`);
  }

  function goNext(next) {
    if (step === QUESTIONS.length - 1) finish(next);
    else setStep(step + 1);
  }

  function choose(optionId) {
    const next = { ...answers, [q.id]: optionId };
    setAnswers(next);
    goNext(next);
  }

  function patch(partial) {
    setAnswers((a) => ({ ...a, ...partial }));
  }

  const activeCity = answers.city || cityParam;
  const cityLabel = CITIES[activeCity]?.label || activeCity;

  return (
    <>
      <main>
        <p className="progress sans">
          {step > 0 ? `${cityLabel} · ` : ""}
          question {step + 1} of {QUESTIONS.length}
        </p>
        <h1 className="q-title">{q.title}</h1>
        <p className="q-blurb">{q.blurb}</p>

        {q.type === "city" ? (
          <div className="pills" role="group" aria-label="City">
            {CITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`pill ${answers.city === opt.id ? "selected" : ""}`}
                aria-pressed={answers.city === opt.id}
                disabled={busy}
                onClick={() => choose(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "choice" ? (
          <div className="options">
            {q.options.map((opt) => (
              <button
                key={String(opt.id)}
                className={`option ${answers[q.id] === opt.id ? "selected" : ""}`}
                onClick={() => choose(opt.id)}
                disabled={busy}
                type="button"
              >
                <span className="label">{opt.label}</span>
                <span className="hint">{opt.hint}</span>
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "commute" ? (
          <div className="panel sans">
            <label className="slider-label">
              <span>{answers.commuteKm} km each way, most days</span>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={answers.commuteKm}
                onChange={(e) => patch({ commuteKm: Number(e.target.value) })}
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={answers.badRoads}
                onChange={(e) => patch({ badRoads: e.target.checked })}
              />
              The roads are bad (potholes, kuccha, ghats)
            </label>
            <button className="btn" type="button" disabled={busy} onClick={() => goNext({ ...answers })}>
              Continue
            </button>
          </div>
        ) : null}

        {q.type === "sleep" ? (
          <div>
            <div className="options">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  className={`option ${answers.parking === opt.id ? "selected" : ""}`}
                  onClick={() => patch({ parking: opt.id })}
                  disabled={busy}
                  type="button"
                >
                  <span className="label">{opt.label}</span>
                  <span className="hint">{opt.hint}</span>
                </button>
              ))}
            </div>
            <label className="check sans">
              <input
                type="checkbox"
                checked={answers.charger}
                onChange={(e) => patch({ charger: e.target.checked })}
              />
              I have a home charger (dedicated parking + plug)
            </label>
            <button
              className="btn"
              type="button"
              disabled={busy || !answers.parking}
              onClick={() => goNext({ ...answers })}
            >
              Continue
            </button>
          </div>
        ) : null}

        {q.type === "slider" ? (
          <div className="panel sans">
            <label className="slider-label">
              <span>{inr(answers.monthlyCap)} / month all-in</span>
              <input
                type="range"
                min={q.min}
                max={q.max}
                step={q.step}
                value={answers.monthlyCap}
                onChange={(e) => patch({ monthlyCap: Number(e.target.value) })}
              />
            </label>
            <p className="fine">
              {answers.monthlyCap <= 20000
                ? "Tight cap: used/CPO is allowed unless you hard-no it later."
                : "New is the default path at this cap."}
            </p>
            <button className="btn" type="button" disabled={busy} onClick={() => goNext({ ...answers })}>
              Continue
            </button>
          </div>
        ) : null}

        {q.type === "hardnos" ? (
          <div>
            <div className="options">
              {q.options.map((opt) => {
                const on = answers.hardNos.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`option ${on ? "selected" : ""}`}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const hardNos = on
                        ? answers.hardNos.filter((id) => id !== opt.id)
                        : [...answers.hardNos, opt.id];
                      patch({ hardNos });
                    }}
                  >
                    <span className="label">{opt.label}</span>
                    <span className="hint">{on ? "On — tap to clear" : "Optional hard no"}</span>
                  </button>
                );
              })}
            </div>
            <button className="btn" type="button" disabled={busy} onClick={() => finish({ ...answers })}>
              {answers.hardNos.length ? "Score my shortlist" : "No hard nos — score my shortlist"}
            </button>
          </div>
        ) : null}

        <div className="row-btns sans">
          <button className="btn secondary" type="button" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>
            Back
          </button>
          {error ? (
            <span className="error">{error}</span>
          ) : (
            <span className="fine">{busy ? "Scoring and saving…" : "No CIBIL, buy-when, or exchange here."}</span>
          )}
        </div>
      </main>

      <ExitDraftModal
        open={showExit}
        onStay={stayOnPage}
        onSave={saveAndLeave}
        saving={draftSaving}
        initialName={savedDraft?.name || ""}
        initialMobile={savedDraft?.mobile || ""}
      />
    </>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<main><p className="fine">Loading interview…</p></main>}>
      <InterviewFlow />
    </Suspense>
  );
}
