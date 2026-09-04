export function HowToPlay() {
  return (
    <section className="rules" aria-labelledby="rules-title">
      <div className="rules__hero">
        <div>
          <span className="eyebrow">Official core game</span>
          <h2 id="rules-title">Ask smart questions. Solve the mystery.</h2>
          <p>Learn the round in under a minute, then pass the card and start playing.</p>
        </div>
        <div className="rules__goal"><strong>7</strong><span>cards to win</span></div>
      </div>
      <ol className="rules__steps">
        <li><span>01</span><div><strong>Choose the card holder</strong><p>The holder privately sees the answer. The next player or team in the rotation guesses.</p></div></li>
        <li><span>02</span><div><strong>Ask up to 10 questions</strong><p>Guessers ask clever yes-or-no questions to narrow down the identity.</p></div></li>
        <li><span>03</span><div><strong>Use clues wisely</strong><p>A player or team may spend a clue when stuck. Clues are limited across the game.</p></div></li>
        <li><span>04</span><div><strong>Guess and collect</strong><p>A correct guess wins the game card. The first player or team to reach the target wins.</p></div></li>
      </ol>
      <div className="rules__callout">
        <strong>This digital edition</strong>
        <p>Supports 2–4 teams or 2–7 individual players. Bonus challenges and the third-buzzword privilege are optional house-rule enhancements in this app.</p>
      </div>
    </section>
  );
}
