"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CITY_OPTIONS } from "../lib/questions.js";
import { clearDraft, loadDraft } from "../lib/draft.js";

export default function HomeStart() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  function start() {
    if (!city) return;
    router.push(`/interview?city=${city}`);
  }

  function resumeDraft() {
    if (!draft) return;
    setCity(draft.city);
    router.push(`/interview?city=${draft.city}`);
  }

  function discardDraft() {
    clearDraft();
    setDraft(null);
  }

  const draftCityLabel = draft ? CITY_OPTIONS.find((c) => c.id === draft.city)?.label || draft.city : "";

  return (
    <>
      {draft ? (
        <div className="draft-banner sans">
          <p className="draft-banner__text">
            <strong>{draft.name || "You"}</strong> left off halfway — {draftCityLabel}, question{" "}
            {(draft.step ?? 0) + 1} of 7. Your answers are saved on this phone.
          </p>
          <div className="draft-banner__actions">
            <button type="button" className="btn" onClick={resumeDraft}>
              Continue where I left off
            </button>
            <button type="button" className="btn secondary" onClick={discardDraft}>
              Start fresh
            </button>
          </div>
        </div>
      ) : null}

      <div className="city-block city-block--card sans">
        <p className="city-label">Which city will this car live in?</p>
        <div className="pills" role="group" aria-label="City">
          {CITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`pill ${city === opt.id ? "selected" : ""}`}
              aria-pressed={city === opt.id}
              onClick={() => setCity(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn--block sans" type="button" disabled={!city} onClick={start}>
        Start the interview
      </button>

      <ul className="rule-pills sans" aria-label="How we score">
        <li className="pill pill--info">On-road pricing</li>
        <li className="pill pill--info">4-star family floor</li>
        <li className="pill pill--info">No EV without charger</li>
        <li className="pill pill--info">CNG where pumps exist</li>
      </ul>
    </>
  );
}
