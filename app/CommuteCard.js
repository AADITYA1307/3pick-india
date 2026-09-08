import { formatMoney } from "../lib/cars.js";
import { commuteLead } from "../lib/copy.js";

export default function CommuteCard({ commute }) {
  const count = commute.rows.length;

  return (
    <article className="forward-card forward-card--commute sans">
      <h2 className="forward-card__title">Commute running cost</h2>
      <p className="forward-card__lead">{commuteLead(count)}</p>

      <dl className="commute-summary">
        <div>
          <dt>Daily commute</dt>
          <dd>{commute.dailyKm} km</dd>
        </div>
        <div>
          <dt>~Monthly km</dt>
          <dd>{commute.kmMonth.toLocaleString("en-IN")} km</dd>
        </div>
        <div>
          <dt>~Yearly km</dt>
          <dd>{commute.kmYear.toLocaleString("en-IN")} km</dd>
        </div>
      </dl>

      <table className="commute-table">
        <thead>
          <tr>
            <th>Pick</th>
            <th>ARAI</th>
            <th>Fuel / month</th>
            <th>Fuel / year</th>
          </tr>
        </thead>
        <tbody>
          {commute.rows.map((r) => (
            <tr key={r.rank}>
              <td>
                <strong>#{r.rank}</strong> {r.name}
                <span className="commute-table__fuel">{r.fuelLabel}</span>
              </td>
              <td>{r.araiMileage}</td>
              <td>{formatMoney(r.monthlyFuel)}</td>
              <td>{formatMoney(r.yearlyFuel)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="forward-card__fine fine">{commute.assumption}</p>
    </article>
  );
}
