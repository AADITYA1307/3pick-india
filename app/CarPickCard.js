import Link from "next/link";

function rankClass(label) {
  if (label === "Strongly Recommended") return "car-card__rank--strong";
  if (label === "Recommended") return "car-card__rank--good";
  return "car-card__rank--consider";
}

export default function CarPickCard({ pick, memoId }) {
  return (
    <article className="car-card">
      <header className="car-card__head">
        <div className="car-card__head-row">
          <div className="car-card__head-main">
            <span className={`car-card__rank sans ${rankClass(pick.rankLabel)}`}>{pick.rankLabel}</span>
            <h3 className="car-card__title">
              #{pick.rank} {pick.name}
            </h3>
          </div>
          {memoId && pick.carId ? (
            <Link
              className="btn secondary car-card__test-drive sans"
              href={`/m/${memoId}/test-drive/${pick.carId}`}
            >
              Book test drive
            </Link>
          ) : null}
        </div>
        <p className="car-card__sub sans">
          {pick.condition} · {pick.body} · {pick.onRoad} on-road · {pick.safety}
        </p>
      </header>

      <dl className="car-card__specs sans">
        <div>
          <dt>India sales</dt>
          <dd>{pick.indiaSales}</dd>
        </div>
        <div>
          <dt>OEM</dt>
          <dd>{pick.oem}</dd>
        </div>
        <div>
          <dt>ARAI mileage</dt>
          <dd>{pick.araiMileage}</dd>
        </div>
        <div>
          <dt>Service interval</dt>
          <dd>{pick.serviceInterval}</dd>
        </div>
        <div className="car-card__specs-wide">
          <dt>Colours</dt>
          <dd>{pick.colours}</dd>
        </div>
      </dl>

      <p className="car-card__summary">{pick.summary}</p>

      <section className="car-card__why">
        <h4 className="sans">Why this car for you</h4>
        <ul>
          {pick.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="car-card__costs sans">
        <h4>All-in monthly (your commute)</h4>
        <p className="car-card__all-in">{pick.allIn}/mo</p>
        <p className="fine">{pick.breakdown}</p>
      </section>

      <p className="car-card__watch">
        <em>Watch:</em> {pick.caveat}
      </p>

      <a className="btn secondary btn--block car-card__cta sans" href="#memo-contact">
        View all-in estimate
      </a>
    </article>
  );
}
