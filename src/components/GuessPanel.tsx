import { useState } from 'react';
import { TeamKey } from '../lib/types';

type GuessPanelProps = {
  guessingTeam: TeamKey;
  participantName: string;
  onSubmit: (team: TeamKey, guess: string) => void;
  onCorrect: (team: TeamKey) => void;
  guessesUsed: number;
};

export function GuessPanel({ guessingTeam, participantName, onSubmit, onCorrect, guessesUsed }: GuessPanelProps) {
  const [text, setText] = useState('');
  const left = Math.max(0, 2 - guessesUsed);
  const submitGuess = () => {
    const guess = text.trim();
    if (!guess || left === 0) return;
    onSubmit(guessingTeam, guess);
    setText('');
  };

  return (
    <div className="gi10-guesspanel">
      <div className="side" style={{ gridColumn: '1 / -1' }}>
        <div className="label">{participantName}'s turn to guess · {left} attempt{left === 1 ? '' : 's'} left</div>
        <div className="row">
          <input className="input" value={text} onChange={event => setText(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter') submitGuess(); }}
            placeholder="Type the answer…" aria-label={`${participantName} guess`} autoComplete="off" />
          <button className="btn" disabled={left === 0 || !text.trim()} onClick={submitGuess}>Lock in answer</button>
        </div>
        <div className="quick-correct">
          <span>Playing verbally?</span>
          <button className="btn correct-outline" disabled={left === 0} onClick={() => onCorrect(guessingTeam)}>{participantName} guessed correctly</button>
        </div>
        {left === 0 && <div className="hint">No guesses left for this card.</div>}
      </div>
    </div>
  );
}
