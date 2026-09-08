"use client";

export default function MemoTabs({ tabs, active, onChange }) {
  return (
    <nav className="memo-tabs sans" aria-label="Decision Memo sections">
      <div className="memo-tabs__track" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`memo-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`memo-panel-${tab.id}`}
            className={`memo-tabs__tab ${active === tab.id ? "is-active" : ""}`}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
