"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizeMobile } from "../lib/contact.js";
import { minBookingDate, TEST_DRIVE_SLOTS, validateTestDriveBooking } from "../lib/testDrive.js";

function formatBookingDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TestDriveBookingClient({ memoId, pick, initialContact, existingBooking }) {
  const [name, setName] = useState(existingBooking?.name || initialContact?.name || "");
  const [mobile, setMobile] = useState(existingBooking?.mobile || initialContact?.mobile || "");
  const [date, setDate] = useState(existingBooking?.date || "");
  const [slot, setSlot] = useState(existingBooking?.slot || "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(Boolean(existingBooking));
  const [saving, setSaving] = useState(false);

  function onMobileChange(value) {
    setMobile(normalizeMobile(value));
    setSaved(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const err = validateTestDriveBooking({ name, mobile, date, slot });
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/shortlist/${memoId}/test-drive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: pick.carId,
          carName: pick.name,
          name: name.trim(),
          mobile,
          date,
          slot,
        }),
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
    <article className="test-drive-booking sans">
      <header className="test-drive-booking__head">
        <p className="test-drive-booking__kicker">Book a test drive</p>
        <h1 className="test-drive-booking__title">
          #{pick.rank} {pick.name}
        </h1>
        <p className="test-drive-booking__lead">
          Pick a one-hour home visit slot between 10 AM and 6 PM. We will use your name and mobile to confirm.
        </p>
      </header>

      {saved ? (
        <div className="test-drive-booking__done">
          <p className="test-drive-booking__done-title">Test drive booked</p>
          <p>
            <strong>{pick.name}</strong>
            <br />
            {formatBookingDate(date)} · {TEST_DRIVE_SLOTS.find((s) => s.value === slot)?.label}
            <br />
            {name} · {mobile}
          </p>
          <Link className="btn secondary" href={`/m/${memoId}`}>
            Back to your memo
          </Link>
        </div>
      ) : (
        <form className="contact-form test-drive-booking__form" onSubmit={onSubmit}>
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

          <label className="contact-field">
            Preferred date
            <input type="date" min={minBookingDate()} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="contact-field">
            Time slot
            <select value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">Select a slot</option>
              {TEST_DRIVE_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="contact-error">{error}</p> : null}

          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Booking…" : "Book test drive"}
          </button>

          <Link className="btn secondary" href={`/m/${memoId}`}>
            Back to memo
          </Link>
        </form>
      )}
    </article>
  );
}
