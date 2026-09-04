import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());

test('renders Mystery Card Night header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Mystery Card Night/i);
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
});
