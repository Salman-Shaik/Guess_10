import { useEffect, useState } from 'react';
import { SetupPage } from './components/SetupPage';
import { GameCard } from './components/GameCard';
import { GuessPanel } from './components/GuessPanel';
import { AppHeader } from './components/AppHeader';
import { ScoreBoard } from './components/ScoreBoard';
import { CategoryKey, Deck, GameState, MatchConfig, SetupConfig, TeamKey } from './lib/types';
import { shuffle } from './lib/utils';
import { advanceBuzzPrivileges, buzzwordsAllowed, leadingTeam } from './lib/gameRules';
import { hydrateDeckImages } from './lib/deckImages';
import { STARTER_DECKS } from './data/starters';
import { inferBundledCategory } from './lib/deckCategory';


function participantOrder(match: MatchConfig): TeamKey[] {
  const configured = match.participantOrder?.filter(key => match.teams[key]) ?? [];
  return configured.length >= 2 ? configured : Object.keys(match.teams);
}

function nextParticipant(current: TeamKey, order: TeamKey[]): TeamKey {
  const index = order.indexOf(current);
  return order[(index + 1 + order.length) % order.length] ?? order[0];
}

function participantRecord<T>(order: TeamKey[], value: T): Record<TeamKey, T> {
  return Object.fromEntries(order.map(key => [key, value]));
}

type Adjudication =
  | { kind: 'guess'; team: TeamKey; text: string }
  | { kind: 'bonus'; team: TeamKey };

type SavedGame = {
  category?: CategoryKey;
  deck: Deck;
  order: number[];
  cursor: number;
  state: GameState;
  match: MatchConfig;
  manualWinner?: TeamKey;
};

const DEFAULT_MATCH: MatchConfig = {
  winMode: 'target',
  winningScore: 7,
  teams: {
    teamA: { name: 'Team A', members: [] },
    teamB: { name: 'Team B', members: [] },
  },
  participantOrder: ['teamA', 'teamB'],
  playMode: 'teams',
};

const SAVED_GAME_KEY = 'guess-in-10-active-game';

function loadSavedGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVED_GAME_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedGame;
    const detectedCategory = inferBundledCategory(saved.deck);
    const category = detectedCategory !== 'custom' ? detectedCategory : saved.category ?? 'custom';
    const bundledDeck = STARTER_DECKS[category] ?? [];
    return {
      ...saved,
      category,
      deck: hydrateDeckImages(saved.deck, bundledDeck),
    };
  } catch {
    localStorage.removeItem(SAVED_GAME_KEY);
    return null;
  }
}

export default function App() {
  const [restoredGame] = useState(loadSavedGame);
  const [page, setPage] = useState<'setup' | 'game'>(restoredGame ? 'game' : 'setup');
  const [deck, setDeck] = useState<Deck>(restoredGame?.deck ?? []);
  const [category, setCategory] = useState<CategoryKey>(restoredGame?.category ?? 'indian_actors');
  const [order, setOrder] = useState<number[]>(restoredGame?.order ?? []);
  const [cursor, setCursor] = useState(restoredGame?.cursor ?? 0);
  const [adjudication, setAdjudication] = useState<Adjudication | null>(null);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showQuestionDecreaseDialog, setShowQuestionDecreaseDialog] = useState(false);
  const [manualWinner, setManualWinner] = useState<TeamKey | undefined>(restoredGame?.manualWinner);
  const [match, setMatch] = useState<MatchConfig>(restoredGame?.match ?? DEFAULT_MATCH);
  const [state, setState] = useState<GameState>(restoredGame?.state ?? {
    holderTeam: 'teamA',
    questionsThisCard: 0,
    guessesThisCard: { teamA: 0, teamB: 0 },
    cluesRemaining: { teamA: 3, teamB: 3 },
    clueUsedOnThisCard: { teamA: false, teamB: false },
    cardsWon: { teamA: 0, teamB: 0 },
    buzzPrivilege: { teamA: false, teamB: false },
  });

  useEffect(() => {
    if (page === 'game' && deck.length) {
      localStorage.setItem(SAVED_GAME_KEY, JSON.stringify({ category, deck, order, cursor, state, match, manualWinner } satisfies SavedGame));
    }
  }, [category, cursor, deck, manualWinner, match, order, page, state]);


  function startGame(cfg: SetupConfig, initial: Deck) {
    const indices = initial.map((_, i) => i);
    const participants = participantOrder(cfg.match);
    setDeck(initial);
    setCategory(cfg.category);
    setOrder(shuffle(indices, Date.now()));
    setCursor(0);
    setMatch(cfg.match);
    setManualWinner(undefined);
    setState({
      holderTeam: cfg.startingHolder,
      questionsThisCard: 0,
      guessesThisCard: participantRecord(participants, 0),
      cluesRemaining: participantRecord(participants, 3),
      clueUsedOnThisCard: participantRecord(participants, false),
      cardsWon: participantRecord(participants, 0),
      buzzPrivilege: participantRecord(participants, false),
    });
    setPage('game');
  }


  const index = order[cursor] ?? 0;
  const card = deck[index];
  const participants = participantOrder(match);
  const guessingTeam = nextParticipant(state.holderTeam, participants);
  const targetWinner = match.winMode === 'target'
    ? participants.find(participant => (state.cardsWon[participant] ?? 0) >= match.winningScore)
    : undefined;
  const currentLeader = leadingTeam(state.cardsWon);
  const deckExhausted = order.length > 0 && cursor >= order.length;
  const deckWinner = deckExhausted ? currentLeader : undefined;
  const winner = manualWinner ?? targetWinner ?? deckWinner;
  const tied = !currentLeader;

  function quitGame() {
    localStorage.removeItem(SAVED_GAME_KEY);
    setShowQuitDialog(false);
    setManualWinner(undefined);
    setPage('setup');
  }

  function endEndlessGame() {
    if (currentLeader) setManualWinner(currentLeader);
  }

  function addTiebreakerCard() {
    if (!deck.length) return;
    const [nextIndex] = shuffle(deck.map((_, index) => index), Date.now());
    setOrder(current => [...current, nextIndex]);
  }


  function nextCard(result?: { cardWinner?: TeamKey; bonusWinner?: TeamKey }) {
    setCursor(c => c + 1);
    setState(s => ({
      ...s,
      questionsThisCard: 0,
      guessesThisCard: participantRecord(participants, 0),
      clueUsedOnThisCard: participantRecord(participants, false),
      holderTeam: nextParticipant(s.holderTeam, participants),
      cardsWon: result?.cardWinner
        ? { ...s.cardsWon, [result.cardWinner]: (s.cardsWon[result.cardWinner] ?? 0) + 1 }
        : s.cardsWon,
      buzzPrivilege: advanceBuzzPrivileges(s.buzzPrivilege, guessingTeam, result?.bonusWinner),
    }));
  }


  function spendClue(team: TeamKey) {
    setState(s => {
      if ((s.cluesRemaining[team] ?? 0) <= 0 || s.clueUsedOnThisCard[team]) return s;
      return {
        ...s,
        cluesRemaining: { ...s.cluesRemaining, [team]: (s.cluesRemaining[team] ?? 0) - 1 },
        clueUsedOnThisCard: { ...s.clueUsedOnThisCard, [team]: true },
      };
    });
  }


  function onIncQ() { setState(s => ({ ...s, questionsThisCard: Math.min(10, s.questionsThisCard + 1) })); }
  function onDecQ() {
    setState(s => ({ ...s, questionsThisCard: Math.max(0, s.questionsThisCard - 1) }));
    setShowQuestionDecreaseDialog(false);
  }


  // Guessing flow — only guessingTeam can guess
  function onTeamGuess(team: TeamKey, text: string) {
    if (team !== guessingTeam) return;
    setAdjudication({ kind: 'guess', team, text });
  }

  function resolveGuess(correct: boolean) {
    if (!adjudication || adjudication.kind !== 'guess') return;
    const { team } = adjudication;

    if (!correct) {
      setState(s => ({
        ...s,
        guessesThisCard: { ...s.guessesThisCard, [team]: Math.min(2, (s.guessesThisCard[team] ?? 0) + 1) },
      }));
      setAdjudication(null);
      return;
    }

    if (card?.bonus_question) setAdjudication({ kind: 'bonus', team });
    else {
      setAdjudication(null);
      nextCard({ cardWinner: team });
    }
  }

  function resolveBonus(correct: boolean) {
    if (!adjudication || adjudication.kind !== 'bonus') return;
    const { team } = adjudication;
    setAdjudication(null);
    nextCard({ cardWinner: team, bonusWinner: correct ? team : undefined });
  }


  // Buzzwords to tell: baseline 2; team with privilege gets 3 on THIS card
  const buzzToTell = buzzwordsAllowed(state, guessingTeam);
  const canUseClue = (team: TeamKey) => (state.cluesRemaining[team] ?? 0) > 0 && !state.clueUsedOnThisCard[team];


  if (page === 'setup') return <SetupPage onStart={startGame} />;


  return (
    <div className="gi10-app">
      <AppHeader />
      <div className="gi10-controls">
        <button className="btn secondary danger-outline" onClick={() => setShowQuitDialog(true)}>Quit game</button>
        {match.winMode === 'endless' && (
          <button className="btn secondary" onClick={endEndlessGame} disabled={tied} title={tied ? 'A winner cannot be declared while scores are tied' : 'Declare the current leader as winner'}>End game</button>
        )}
        <div className="spacer" />
        <div className="gi10-qcounter"><span className="label">Questions</span>
          <button className="btn secondary question-decrease" onClick={() => setShowQuestionDecreaseDialog(true)} disabled={state.questionsThisCard === 0} aria-label="Decrease question count">−</button>
          <button className="btn" onClick={onIncQ} disabled={state.questionsThisCard >= 10}>+1</button>
        </div>
      </div>


      <ScoreBoard state={state} match={match} />


      {winner ? (
        <div className="gi10-winner">
          <div>🏆 {match.teams[winner].name} wins!</div>
          <small>{state.cardsWon[winner] ?? 0} cards collected</small>
          <button className="btn" onClick={quitGame}>Finish game</button>
        </div>
      ) : card ? (
        <>
          <div className="gi10-note">
            <span><strong>{match.teams[state.holderTeam].name}</strong> holds the card.</span>
            <span><strong>{match.teams[guessingTeam].name}</strong> is guessing.</span>
          </div>


          <GameCard
            card={card}
            buzzToTell={buzzToTell}
            clueUsed={state.clueUsedOnThisCard[state.holderTeam]}
            canUseClue={canUseClue(state.holderTeam)}
            onUseClue={() => spendClue(state.holderTeam)}
          />


          <GuessPanel
            guessingTeam={guessingTeam}
            participantName={match.teams[guessingTeam]?.name ?? 'Next participant'}
            onSubmit={onTeamGuess}
            guessesUsed={state.guessesThisCard[guessingTeam] ?? 0}
          />


          <div className="gi10-actions" style={{ justifyContent: 'space-between' }}>
            <button className="btn secondary" onClick={() => nextCard()}>Skip Card</button>
            <button className="btn" onClick={() => setState(s => ({ ...s, buzzPrivilege: participantRecord(participants, false) }))}>Clear 3rd-Buzz Privilege</button>
          </div>
        </>
      ) : deckExhausted && tied ? (
        <div className="gi10-empty">
          <h2>Scores are tied</h2>
          <p>Play one sudden-death card. The team that wins it wins the game.</p>
          <button className="btn" onClick={addTiebreakerCard}>Play tiebreaker card</button>
        </div>
      ) : (
        <div className="gi10-empty">No cards available. Go back to setup and import your JSON.</div>
      )}

      {adjudication && (
        <div className="gi10-modal" role="dialog" aria-modal="true" aria-labelledby="adjudication-title">
          <div className="gi10-modal__dialog adjudication-dialog">
            {adjudication.kind === 'guess' ? (
              <>
                <span className="eyebrow">Confirm the guess</span>
                <h2 id="adjudication-title">Was {match.teams[adjudication.team].name} correct?</h2>
                <div className="submitted-answer">“{adjudication.text}”</div>
                <p>Incorrect uses one of this team's two guesses. Correct awards the card after the bonus.</p>
                <div className="adjudication-actions">
                  <button className="btn incorrect" onClick={() => resolveGuess(false)}>Incorrect answer</button>
                  <button className="btn correct" onClick={() => resolveGuess(true)}>Correct answer</button>
                </div>
              </>
            ) : (
              <>
                <span className="eyebrow">Bonus challenge · {match.teams[adjudication.team].name}</span>
                <h2 id="adjudication-title">{card?.bonus_question}</h2>
                {card?.bonus_answer && <div className="bonus-reference"><span>Answer guide</span><strong>{card.bonus_answer}</strong></div>}
                <p>A correct bonus unlocks the third buzzword the next time {match.teams[adjudication.team].name} is the guessing team.</p>
                <div className="adjudication-actions">
                  <button className="btn incorrect" onClick={() => resolveBonus(false)}>Bonus incorrect</button>
                  <button className="btn correct" onClick={() => resolveBonus(true)}>Bonus correct</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showQuitDialog && (
        <div className="gi10-modal" role="dialog" aria-modal="true" aria-labelledby="quit-title">
          <div className="gi10-modal__dialog adjudication-dialog">
            <span className="eyebrow">Terminate match</span>
            <h2 id="quit-title">Quit this game?</h2>
            <p>The active game and its saved progress will be permanently removed.</p>
            <div className="adjudication-actions">
              <button className="btn secondary" onClick={() => setShowQuitDialog(false)}>Keep playing</button>
              <button className="btn incorrect" onClick={quitGame}>Quit game</button>
            </div>
          </div>
        </div>
      )}

      {showQuestionDecreaseDialog && (
        <div className="gi10-modal" role="dialog" aria-modal="true" aria-labelledby="question-decrease-title">
          <div className="gi10-modal__dialog compact-dialog">
            <span className="eyebrow">Correct question count</span>
            <h2 id="question-decrease-title">Remove one question?</h2>
            <p>The counter will change from {state.questionsThisCard} to {Math.max(0, state.questionsThisCard - 1)}.</p>
            <div className="adjudication-actions">
              <button className="btn secondary" onClick={() => setShowQuestionDecreaseDialog(false)}>Cancel</button>
              <button className="btn" onClick={onDecQ}>Remove one</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
