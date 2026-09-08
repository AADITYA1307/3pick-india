"use client";

import { useState } from "react";
import { contactLead } from "../lib/copy.js";
import { normalizeMobile, validateContact } from "../lib/contact.js";

export default function ContactCard({ memoId, initialContact, pickCount = 0 }) {
  const [name, setName] = useState(initialContact?.name || "");
  const [mobile, setMobile] = useState(initialContact?.mobile || "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(Boolean(initialContact?.name && initialContact?.mobile));
  const [saving, setSaving] = useState(false);

  function onMobileChange(value) {
    setMobile(normalizeMobile(value));
    setSaved(false);
  }

  async function onSave(e) {
    e.preventDefault();
    const err = validateContact({ name, mobile });
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/shortlist/${memoId}/contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save. Try again.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Could not save. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="contact-card sans" id="memo-contact">
      <header className="contact-card__head">
        <p className="contact-card__kicker">Almost done</p>
        <h2 className="contact-card__title">Your name and mobile</h2>
        <p className="contact-card__lead">{contactLead(pickCount)}</p>
      </header>

      <form className="contact-form" onSubmit={onSave}>
        <label className="contact-field">
          Name
          <input
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
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
            onChange={(e) => onMobileChange(e.target.value)}
          />
        </label>

        {error ? <p className="contact-error">{error}</p> : null}
        {saved ? <p className="contact-saved">Saved — we will not add your number to the WhatsApp share.</p> : null}

        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : saved ? "Update details" : "Save details"}
        </button>
      </form>
    </section>
  );
}
