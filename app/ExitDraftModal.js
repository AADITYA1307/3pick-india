"use client";

import { useEffect, useState } from "react";
import { normalizeMobile, validateContact } from "../lib/contact.js";

export default function ExitDraftModal({ open, onStay, onSave, saving, initialName = "", initialMobile = "" }) {
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setName(initialName);
      setMobile(initialMobile);
    }
  }, [open, initialName, initialMobile]);

  if (!open) return null;

  function handleSave(e) {
    e.preventDefault();
    const err = validateContact({ name, mobile });
    if (err) {
      setError(err);
      return;
    }
    onSave({ name: name.trim(), mobile: normalizeMobile(mobile) });
  }

  return (
    <div className="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
      <div className="exit-modal__backdrop" onClick={onStay} aria-hidden="true" />
      <div className="exit-modal__panel sans">
        <h2 id="exit-modal-title" className="exit-modal__title">
          Leaving already?
        </h2>
        <p className="exit-modal__text">
          Leave your name and mobile number. We will keep your answers on this phone so you can pick up where
          you stopped — no need to do all the questions again.
        </p>

        <form onSubmit={handleSave} className="exit-modal__form">
          <label className="contact-field">
            Your name
            <input
              type="text"
              autoComplete="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="contact-field">
            Mobile number
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10 digits — no +91"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(normalizeMobile(e.target.value))}
            />
          </label>

          {error ? <p className="contact-error">{error}</p> : null}

          <div className="exit-modal__actions">
            <button type="button" className="btn secondary" onClick={onStay} disabled={saving}>
              Stay on this page
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save and leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
