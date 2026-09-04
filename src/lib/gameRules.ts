import { GameState, TeamKey } from './types';

export function buzzwordsAllowed(state: GameState, guessingTeam: TeamKey): 2 | 3 {
  return state.buzzPrivilege[guessingTeam] ? 3 : 2;
}

export function advanceBuzzPrivileges(
  current: GameState['buzzPrivilege'],
  guessingTeam: TeamKey,
  bonusWinner?: TeamKey,
): GameState['buzzPrivilege'] {
  return {
    ...current,
    [guessingTeam]: false,
    ...(bonusWinner ? { [bonusWinner]: true } : {}),
  };
}

export function leadingTeam(scores: GameState['cardsWon']): TeamKey | undefined {
  const entries = Object.entries(scores);
  if (!entries.length) return undefined;
  const highest = Math.max(...entries.map(([, score]) => score));
  const leaders = entries.filter(([, score]) => score === highest);
  return leaders.length === 1 ? leaders[0][0] : undefined;
}
