export type CategoryKey = 'indian_actors' | 'pokemon' | 'mcu' | 'cricket' | 'telugu_movies' | 'anime' | 'custom';
export type IconInfo = {
  starTag: string;
  placeOfBirth: string;
  highestAward: string;
  alsoKnownFor: string;
};


export type CardItem = {
  name: string;
  buzzwords: string[];
  clues: string[];
  icon_info: IconInfo;
  bonus_question?: string;
  bonus_answer?: string;
  imageUrl?: string;
  imageSourceUrl?: string;
};


export type Deck = CardItem[];

export type DeckRegistry = Partial<Record<CategoryKey, Deck>>;

export type TeamKey = string;

export type TeamProfile = {
  name: string;
  members: string[];
};

export type MatchConfig = {
  winMode: 'target' | 'endless';
  winningScore: number;
  teams: Record<TeamKey, TeamProfile>;
  participantOrder?: TeamKey[];
  playMode?: 'teams' | 'individuals';
};


export type GameState = {
  holderTeam: TeamKey;
  questionsThisCard: number;
  guessesThisCard: Record<TeamKey, number>;
  cluesRemaining: Record<TeamKey, number>;
  clueUsedOnThisCard: Record<TeamKey, boolean>;
  cardsWon: Record<TeamKey, number>;
  buzzPrivilege: Record<TeamKey, boolean>;
};


export type SetupConfig = {
  category: CategoryKey;
  startingHolder: TeamKey;
  playMode?: 'teams' | 'individuals';
  participantNames?: string[];
  roomCode?: string;
  match: MatchConfig;
};
