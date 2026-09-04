import { useState } from 'react';
import { CategoryKey, Deck, SetupConfig, TeamKey } from '../lib/types';
import { STARTER_DECKS } from '../data/starters';
import { inferBundledCategory } from '../lib/deckCategory';
import { hydrateDeckImages } from '../lib/deckImages';
import { DeckImporter } from './DeckImporter';
import { HowToPlay } from './HowToPlay';

type SetupPageProps = { onStart: (config: SetupConfig, initialDeck: Deck) => void };
type ParticipantDraft = { id: TeamKey; name: string; members: string };

function loadDeckFor(category: CategoryKey): Deck {
  const bundledDeck = STARTER_DECKS[category] ?? [];
  const raw = localStorage.getItem(`deck-${category}-all`);
  if (raw) {
    try {
      const stored = JSON.parse(raw) as Deck;
      const detected = inferBundledCategory(stored);
      if (bundledDeck.length && detected !== 'custom' && detected !== category) return bundledDeck;
      return bundledDeck.length ? hydrateDeckImages(stored, bundledDeck) : stored;
    } catch { /* fall through to the bundled deck */ }
  }
  return bundledDeck;
}

function defaultParticipants(mode: 'teams' | 'individuals'): ParticipantDraft[] {
  return Array.from({ length: 7 }, (_, index) => ({ id: `participant-${index + 1}`, name: `${mode === 'teams' ? 'Team' : 'Player'} ${index + 1}`, members: '' }));
}

export function SetupPage({ onStart }: SetupPageProps) {
  const [view, setView] = useState<'setup' | 'rules'>('setup');
  const [category, setCategory] = useState<CategoryKey>('indian_actors');
  const [deck, setDeck] = useState<Deck>(() => loadDeckFor('indian_actors'));
  const [playMode, setPlayMode] = useState<'teams' | 'individuals'>('teams');
  const [participantCount, setParticipantCount] = useState(2);
  const [participants, setParticipants] = useState<ParticipantDraft[]>(() => defaultParticipants('teams'));
  const [startingHolder, setStartingHolder] = useState<TeamKey>('participant-1');
  const [winMode, setWinMode] = useState<'target' | 'endless'>('target');
  const [winningScore, setWinningScore] = useState(7);
  const activeParticipants = participants.slice(0, participantCount);

  function chooseCategory(next: CategoryKey) { setCategory(next); setDeck(loadDeckFor(next)); }
  function chooseMode(next: 'teams' | 'individuals') { setPlayMode(next); setParticipantCount(2); setParticipants(defaultParticipants(next)); setStartingHolder('participant-1'); }
  function updateParticipant(index: number, field: 'name' | 'members', value: string) {
    setParticipants(current => current.map((participant, participantIndex) => participantIndex === index ? { ...participant, [field]: value } : participant));
  }
  function chooseParticipantCount(count: number) {
    setParticipantCount(count);
    if (!participants.slice(0, count).some(participant => participant.id === startingHolder)) setStartingHolder('participant-1');
  }

  const categoryOptions: Array<[CategoryKey, string]> = [
    ['indian_actors', 'Indian Actors'], ['pokemon', 'Pokémon'], ['mcu', 'MCU'], ['cricket', 'World Cricket Legends'],
    ['telugu_movies', 'Telugu Movies'], ['anime', 'Anime Characters'], ['custom', 'Custom Deck'],
  ];
  const allowedCounts = playMode === 'teams' ? [2, 3, 4] : [2, 3, 4, 5, 6, 7];
  const allNamesValid = activeParticipants.every(participant => participant.name.trim());

  return <div className="gi10-app setup-screen">
    <header className="gi10-header">
      <div><span className="eyebrow">The smart questions game</span><h1 className="gi10-title">Mystery Card Night</h1></div>
      <div className="setup-nav" role="tablist" aria-label="Game information">
        <button className={view === 'setup' ? 'is-active' : ''} onClick={() => setView('setup')}>Set up game</button>
        <button className={view === 'rules' ? 'is-active' : ''} onClick={() => setView('rules')}>How to play</button>
      </div>
    </header>

    {view === 'rules' ? <HowToPlay /> : <>
      <section className="setup-intro">
        <div><span className="eyebrow">Game night starts here</span><h2>Create your game</h2><p>Pick a deck, set the rules, and start playing.</p></div>
        <div className="setup-mode-status"><span className="status-dot" /> Same device <span className="status-divider" /> Online rooms coming soon</div>
      </section>

      <main className="game-builder">
        <section className="builder-section">
          <div className="builder-section__head">
            <div className="builder-heading"><span className="builder-step">1</span><div><label className="gi10-label">Choose category</label><p>{deck.length} cards ready</p></div></div>
            <DeckImporter category={category} onImported={setDeck} />
          </div>
          <div className="gi10-seg category-grid">{categoryOptions.map(([key, label]) => <button key={key} className={`gi10-seg__btn ${category === key ? 'is-active' : ''}`} onClick={() => chooseCategory(key)}>{label}</button>)}</div>
        </section>

        <section className="builder-section">
          <div className="builder-heading builder-heading--section"><span className="builder-step">2</span><div><label className="gi10-label">Game rules</label><p>Set the table in a few taps.</p></div></div>
          <div className="builder-control-grid">
            <div className="builder-control"><label className="gi10-label">Play format</label><div className="gi10-seg"><button className={`gi10-seg__btn ${playMode === 'teams' ? 'is-active' : ''}`} onClick={() => chooseMode('teams')}>Teams</button><button className={`gi10-seg__btn ${playMode === 'individuals' ? 'is-active' : ''}`} onClick={() => chooseMode('individuals')}>Individuals</button></div></div>
            <div className="builder-control"><label className="gi10-label">Number of {playMode === 'teams' ? 'teams' : 'players'}</label><div className="gi10-seg count-grid">{allowedCounts.map(count => <button key={count} className={`gi10-seg__btn ${participantCount === count ? 'is-active' : ''}`} onClick={() => chooseParticipantCount(count)}>{count}</button>)}</div></div>
            <div className="builder-control"><label className="gi10-label">First card holder</label><div className="gi10-seg holder-grid">{activeParticipants.map(participant => <button key={participant.id} className={`gi10-seg__btn ${startingHolder === participant.id ? 'is-active' : ''}`} onClick={() => setStartingHolder(participant.id)}>{participant.name || 'Unnamed'}</button>)}</div></div>
            <div className="builder-control"><label className="gi10-label">Match type</label><div className="gi10-seg"><button className={`gi10-seg__btn ${winMode === 'target' ? 'is-active' : ''}`} onClick={() => setWinMode('target')}>Target</button><button className={`gi10-seg__btn ${winMode === 'endless' ? 'is-active' : ''}`} onClick={() => setWinMode('endless')}>Endless</button></div>{winMode === 'target' ? <label className="score-input">Cards to win <input type="number" min="7" max="99" value={winningScore} onChange={event => setWinningScore(Math.max(7, Number(event.target.value) || 7))} /></label> : <p className="field-help">Host ends the game.</p>}</div>
          </div>
        </section>

        <section className="builder-section">
          <div className="builder-heading builder-heading--section"><span className="builder-step">3</span><div><label className="gi10-label">{playMode === 'teams' ? 'Name your teams' : 'Name the players'}</label><p>{playMode === 'teams' ? 'Members are optional metadata.' : 'These names appear on the scoreboard.'}</p></div></div>
          <div className="participant-editors">{activeParticipants.map((participant, index) => <div key={participant.id} className="participant-editor">
            <label className="gi10-label" htmlFor={`${participant.id}-name`}>{playMode === 'teams' ? `Team ${index + 1}` : `Player ${index + 1}`}</label>
            <input id={`${participant.id}-name`} className="input" value={participant.name} maxLength={24} onChange={event => updateParticipant(index, 'name', event.target.value)} />
            {playMode === 'teams' && <input id={`${participant.id}-members`} aria-label={`${participant.name} members`} className="input input--secondary" value={participant.members} onChange={event => updateParticipant(index, 'members', event.target.value)} placeholder="Members: Alex, Sam (optional)" />}
          </div>)}</div>
        </section>

        <div className="setup-recap" aria-label="Game summary">
          <span><strong>{deck.length}</strong> cards</span><span><strong>{participantCount}</strong> {playMode === 'teams' ? 'teams' : 'players'}</span><span>Starts: <strong>{activeParticipants.find(item => item.id === startingHolder)?.name}</strong></span><span>Win: <strong>{winMode === 'target' ? `${winningScore} cards` : 'Endless'}</strong></span>
        </div>
      </main>

      <div className="setup-footer">
        <button className="rules-link" onClick={() => setView('rules')}>New here? Read the 60-second rules</button>
        <button className="btn start-button" disabled={!deck.length || !allNamesValid} onClick={() => {
          const teams = Object.fromEntries(activeParticipants.map(participant => [participant.id, { name: participant.name.trim(), members: playMode === 'teams' ? participant.members.split(',').map(name => name.trim()).filter(Boolean) : [] }]));
          onStart({ category, startingHolder, playMode, participantNames: activeParticipants.map(item => item.name.trim()), match: { winMode, winningScore, teams, participantOrder: activeParticipants.map(item => item.id), playMode } }, deck);
        }}>Start game <span>→</span></button>
      </div>
    </>}
  </div>;
}
