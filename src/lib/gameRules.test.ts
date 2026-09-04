import { advanceBuzzPrivileges, buzzwordsAllowed, leadingTeam } from './gameRules';
import { GameState } from './types';

const state: GameState = {
  holderTeam: 'teamB',
  questionsThisCard: 0,
  guessesThisCard: { teamA: 0, teamB: 0 },
  cluesRemaining: { teamA: 3, teamB: 3 },
  clueUsedOnThisCard: { teamA: false, teamB: false },
  cardsWon: { teamA: 0, teamB: 0 },
  buzzPrivilege: { teamA: true, teamB: false },
};

test('unlocks the third buzzword for the guessing team that earned the bonus', () => {
  expect(buzzwordsAllowed(state, 'teamA')).toBe(3);
  expect(buzzwordsAllowed(state, 'teamB')).toBe(2);
});

test('does not declare a leader when an endless game is tied', () => {
  expect(leadingTeam({ teamA: 4, teamB: 4 })).toBeUndefined();
  expect(leadingTeam({ teamA: 5, teamB: 4 })).toBe('teamA');
});

test('finds a unique leader across multiple participants', () => {
  expect(leadingTeam({ p1: 2, p2: 5, p3: 3, p4: 1 })).toBe('p2');
  expect(leadingTeam({ p1: 5, p2: 5, p3: 3 })).toBeUndefined();
});

test('has no leader when there are no scores', () => {
  expect(leadingTeam({})).toBeUndefined();
});

test('holds a bonus privilege until the earning team guesses again', () => {
  let privileges = advanceBuzzPrivileges({ teamA: false, teamB: false }, 'teamA', 'teamA');
  expect(privileges).toEqual({ teamA: true, teamB: false });

  privileges = advanceBuzzPrivileges(privileges, 'teamB');
  expect(privileges).toEqual({ teamA: true, teamB: false });

  privileges = advanceBuzzPrivileges(privileges, 'teamA');
  expect(privileges).toEqual({ teamA: false, teamB: false });
});
