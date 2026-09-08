import Link from "next/link";
import Brand from "./Brand";
import DecisionMemoBox from "./DecisionMemoBox";

export default function SiteHeader() {
  return (
    <header className="site-header sans">
      <div className="header-inner">
        <div className="header-brand-row">
          <Link href="/" className="cardekho-logo-link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cardekho-logo.png" alt="CarDekho" className="cardekho-logo" />
          </Link>
          <span className="header-divider" aria-hidden="true" />
          <Link href="/" className="brand">
            <Brand />
          </Link>
        </div>
        <DecisionMemoBox compact />
      </div>
    </header>
  );
}
