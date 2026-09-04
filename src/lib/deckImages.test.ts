import { hydrateDeckImages } from './deckImages';
import { Deck } from './types';

const card = (name: string, imageUrl?: string): Deck[number] => ({
  name,
  buzzwords: ['one', 'two', 'three'],
  clues: ['one', 'two', 'three'],
  icon_info: { starTag: 'tag', placeOfBirth: 'place', highestAward: 'award', alsoKnownFor: 'fact' },
  imageUrl,
});

test('adds current images to an old saved deck without replacing game content', () => {
  const saved = card('Shivaji Ganesan');
  const hydrated = hydrateDeckImages([saved], [{ ...card('Sivaji Ganesan', 'https://example.com/sivaji.jpg'), imageSourceUrl: 'https://example.com/source' }]);

  expect(hydrated[0]).toMatchObject({
    name: 'Shivaji Ganesan',
    imageUrl: 'https://example.com/sivaji.jpg',
    imageSourceUrl: 'https://example.com/source',
  });
});
