export default function MemoDisclaimers({ items }) {
  if (!items?.length) return null;

  return (
    <section className="memo-section memo-disclaimers sans" aria-label="Estimates and disclaimers">
      <h2>Estimates — not a final quote</h2>
      <ul>
        {items.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
