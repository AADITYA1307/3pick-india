const FIELD_LABELS = {
  city: "City",
  household: "Household",
  commute: "Daily commute",
  parking: "Parking & charger",
  monthlyCap: "Monthly cap",
  keepYears: "Ownership",
  hardNos: "Hard nos",
};

export default function InterviewSummaryCard({ interview }) {
  const entries = Object.entries(interview);

  return (
    <article className="interview-summary sans">
      <p className="interview-summary__kicker">Your interview</p>
      <h2 className="interview-summary__title">What you told us</h2>
      <p className="interview-summary__lead">These answers shaped your shortlist and all-in estimates.</p>

      <dl className="interview-summary__grid">
        {entries.map(([key, value]) => (
          <div key={key} className="interview-summary__row">
            <dt>{FIELD_LABELS[key] || key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
