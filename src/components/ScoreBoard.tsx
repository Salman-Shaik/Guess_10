import { GameState, MatchConfig } from '../lib/types';

export function ScoreBoard({ state, match }: { state: GameState; match: MatchConfig }) {
  const scoreSuffix = match.winMode === 'target' ? ` / ${match.winningScore}` : '';
  const participants = match.participantOrder ?? Object.keys(match.teams);
  const modeLabel = match.playMode === 'individuals' ? 'player' : 'team';

  return (
    <div className="gi10-scorebar">
      {participants.map((participant, index) => {
        const profile = match.teams[participant];
        if (!profile) return null;
        const details = match.playMode === 'individuals'
          ? `${state.cluesRemaining[participant] ?? 0} clues remaining`
          : `${profile.members.join(' · ') || 'No members listed'} · ${state.cluesRemaining[participant] ?? 0} clues`;
        return (
          <div key={participant} className={`gi10-scoreblock participant-${index + 1} ${state.holderTeam === participant ? 'is-active' : ''}`}>
            <div className="label">{profile.name}</div>
            <div className="value">{state.cardsWon[participant] ?? 0}{scoreSuffix}</div>
            <div className="mini">{details}</div>
          </div>
        );
      })}
      <div className="gi10-scoreblock">
        <div className="label">Questions Left</div>
        <div className="value">{Math.max(0, 10 - state.questionsThisCard)}</div>
        <div className="mini">Maximum 10 per card</div>
      </div>
      <div className="gi10-scoreblock">
        <div className="label">Card holder</div>
        <div className="value">{match.teams[state.holderTeam]?.name ?? 'Unknown'}</div>
        <div className="mini">Next {modeLabel} is guessing</div>
      </div>
    </div>
  );
}
