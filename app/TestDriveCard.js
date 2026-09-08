import { testDriveLead, testDriveTitle } from "../lib/copy.js";

export default function TestDriveCard({ picks }) {
  const count = picks.length;

  return (
    <section className="test-drive-card sans">
      <p className="test-drive-card__kicker">Home test drive — closer than the showroom</p>
      <h2 className="test-drive-card__title">{testDriveTitle(count)}</h2>
      <p className="test-drive-card__lead">{testDriveLead(count)}</p>

      <ul className="test-drive-card__picks">
        {picks.map((p) => (
          <li key={p.rank}>
            <strong>#{p.rank}</strong> {p.name}
          </li>
        ))}
      </ul>

      <a className="btn secondary btn--block test-drive-card__cta" href="#memo-contact">
        Sit in {count === 1 ? "it" : "one"} this weekend
      </a>
      <p className="test-drive-card__fine fine">Leave your name and mobile below — someone can line up a home visit.</p>
    </section>
  );
}
