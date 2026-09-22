import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());

test('renders Guess in 10 header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Guess in 10/i);
  expect(headerElement).toBeInTheDocument();
});

test('declares the score leader when the deck is exhausted', () => {
  localStorage.setItem('guess-in-10-active-game', JSON.stringify({
    category: 'custom',
    deck: [{
      name: 'Test card',
      buzzwords: ['one', 'two', 'three'],
      clues: ['one', 'two', 'three'],
      icon_info: { starTag: 'tag', placeOfBirth: 'place', highestAward: 'award', alsoKnownFor: 'fact' },
    }],
    order: [0],
    cursor: 1,
    state: {
      holderTeam: 'teamA',
      questionsThisCard: 0,
      guessesThisCard: { teamA: 0, teamB: 0 },
      cluesRemaining: { teamA: 3, teamB: 3 },
      clueUsedOnThisCard: { teamA: false, teamB: false },
      cardsWon: { teamA: 2, teamB: 1 },
      buzzPrivilege: { teamA: false, teamB: false },
    },
    match: {
      winMode: 'endless',
      winningScore: 7,
      teams: { teamA: { name: 'Team A', members: [] }, teamB: { name: 'Team B', members: [] } },
    },
  }));

  render(<App />);
  expect(screen.getByText(/Team A wins!/i)).toBeInTheDocument();
  expect(screen.getByText(/deck is complete.*highest score/i)).toBeInTheDocument();
});

test('hides the next card until the new holder checks in', () => {
  localStorage.setItem('guess-in-10-active-game', JSON.stringify({
    category: 'custom',
    deck: [{ name: 'Secret card', buzzwords: ['one', 'two', 'three'], clues: ['one', 'two', 'three'], icon_info: { starTag: 'tag', placeOfBirth: 'place', highestAward: 'award', alsoKnownFor: 'fact' } }],
    order: [0], cursor: 0, awaitingHandoff: true,
    state: { holderTeam: 'teamB', questionsThisCard: 0, guessesThisCard: { teamA: 0, teamB: 0 }, cluesRemaining: { teamA: 3, teamB: 3 }, clueUsedOnThisCard: { teamA: false, teamB: false }, cardsWon: { teamA: 0, teamB: 0 }, buzzPrivilege: { teamA: false, teamB: false } },
    match: { winMode: 'target', winningScore: 7, teams: { teamA: { name: 'Team A', members: [] }, teamB: { name: 'Team B', members: [] } }, participantOrder: ['teamA', 'teamB'] },
  }));

  render(<App />);
  expect(screen.getByRole('heading', { name: /Pass the device to Team B/i })).toBeInTheDocument();
  expect(screen.queryByText('Secret card')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Team B is ready' }));
  expect(screen.getByText('Secret card')).toBeInTheDocument();
});
