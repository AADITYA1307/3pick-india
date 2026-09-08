import HomeStart from "./HomeStart";

export default function HomePage() {
  return (
    <main className="hero hero--solo">
      <p className="sans fine kicker">Not a listing site</p>
      <h1>Confused about which car to buy?</h1>
      <p className="hero-hook sans">Short life interview → up to 3 cars → a Decision Memo you can defend.</p>
      <ol className="flow-steps sans">
        <li>Seven life questions</li>
        <li>At most three picks, scored in code</li>
        <li>One memo for your household</li>
      </ol>
      <HomeStart />
    </main>
  );
}
