export default function MemoCompareTable({ picks }) {
  if (!picks?.length) return null;

  return (
    <section className="memo-section compare-table-wrap sans">
      <h2>Side by side</h2>
      <p className="fine">The three numbers that matter first — all-in monthly, on-road, and the fit score.</p>
      <div className="compare-table-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th> </th>
              {picks.map((p) => (
                <th key={p.rank}>
                  <span className="compare-table__rank">{p.rankLabel}</span>
                  <span className="compare-table__name">#{p.rank} {p.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">All-in / month</th>
              {picks.map((p) => (
                <td key={p.rank}>
                  <strong>{p.allIn}</strong>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">On-road</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.onRoad}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Fit score</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.score}/100</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Safety</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.safety}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Body</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.body}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Fuel</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.fuel}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Mileage</th>
              {picks.map((p) => (
                <td key={p.rank}>{p.araiMileage}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
