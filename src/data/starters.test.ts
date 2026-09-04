import { inferBundledCategory } from '../lib/deckCategory';
import { CategoryKey } from '../lib/types';
import { STARTER_DECKS } from './starters';

const bundledDecks: Array<{ category: CategoryKey; label: string; count: number }> = [
  { category: 'indian_actors', label: 'Indian Actors', count: 68 },
  { category: 'pokemon', label: 'Pokémon', count: 100 },
  { category: 'mcu', label: 'MCU', count: 100 },
  { category: 'cricket', label: 'World Cricket Legends', count: 30 },
  { category: 'telugu_movies', label: 'Telugu Movies', count: 100 },
  { category: 'anime', label: 'Anime Characters', count: 100 },
];

test.each(bundledDecks)('$label deck has valid, unique cards', ({ category, count }) => {
  const deck = STARTER_DECKS[category] ?? [];
  expect(deck).toHaveLength(count);
  expect(new Set(deck.map(card => card.name)).size).toBe(deck.length);

  for (const card of deck) {
    expect(card.name.trim()).not.toBe('');
    expect(card.buzzwords).toHaveLength(3);
    expect(card.clues.length).toBeGreaterThanOrEqual(3);
    expect(Object.values(card.icon_info).every(Boolean)).toBe(true);
    expect(card.bonus_question?.trim()).not.toBe('');
    expect(card.bonus_answer?.trim()).not.toBe('');
    expect(card.imageUrl).toMatch(/^(https:\/\/|\/images\/)/);
    expect(card.imageUrl).not.toContain('[');
    expect(card.imageSourceUrl).toMatch(/^https:\/\//);
    expect(card.imageSourceUrl).not.toContain('[');
  }
  expect(new Set(deck.map(card => card.imageUrl)).size).toBe(deck.length);
});

test.each(bundledDecks)('recognizes the $label bundled deck', ({ category }) => {
  expect(inferBundledCategory((STARTER_DECKS[category] ?? []).slice(0, 3))).toBe(category);
});

test('Nagarjuna uses the verified actor portrait', () => {
  expect(STARTER_DECKS.indian_actors?.find(card => card.name === 'Nagarjuna')).toMatchObject({
    imageUrl: '/images/indian-actors/nagarjuna.jpg',
    imageSourceUrl: expect.stringContaining('themoviedb.org/person/149958'),
  });
});

test('new visual categories use local artwork', () => {
  expect((STARTER_DECKS.cricket ?? []).every(card => card.imageUrl?.startsWith('/images/cricket/'))).toBe(true);
  expect((STARTER_DECKS.telugu_movies ?? []).every(card => card.imageUrl?.startsWith('/images/telugu-movies/'))).toBe(true);
  expect((STARTER_DECKS.anime ?? []).every(card => card.imageUrl?.startsWith('/images/anime/'))).toBe(true);
});
