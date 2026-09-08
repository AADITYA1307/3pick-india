export default function DecisionMemoBox({ compact = false }) {
  return (
    <div className={`decision-memo-box sans${compact ? " decision-memo-box--compact" : ""}`}>
      <p className="decision-memo-title">Decision Memo</p>
    </div>
  );
}
