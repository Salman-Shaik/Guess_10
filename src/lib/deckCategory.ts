import { STARTER_DECKS } from '../data/starters';
import { CategoryKey, Deck } from './types';

const BUNDLED_CATEGORIES: CategoryKey[] = ['indian_actors', 'pokemon', 'mcu', 'cricket', 'telugu_movies', 'anime'];

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function inferBundledCategory(deck: Deck, minimumMatches = 3): CategoryKey {
  const names = new Set(deck.map(card => normalizeName(card.name)));
  let bestCategory: CategoryKey = 'custom';
  let bestMatches = 0;

  for (const category of BUNDLED_CATEGORIES) {
    const matches = STARTER_DECKS[category]!
      .filter(card => names.has(normalizeName(card.name))).length;
    if (matches > bestMatches) {
      bestCategory = category;
      bestMatches = matches;
    }
  }

  return bestMatches >= minimumMatches ? bestCategory : 'custom';
}
