import { Deck } from './types';

const LEGACY_NAMES: Record<string, string> = {
  aishwaryarai: 'aishwaryaraibachchan',
  balakrishna: 'nandamuribalakrishna',
  samantha: 'samantharuthprabhu',
  shivajiganesan: 'sivajiganesan',
  trisha: 'trishakrishnan',
};

function normalizedName(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return LEGACY_NAMES[normalized] ?? normalized;
}

export function hydrateDeckImages(deck: Deck, reference: Deck): Deck {
  const images = new Map(reference.map(card => [normalizedName(card.name), {
    imageUrl: card.imageUrl,
    imageSourceUrl: card.imageSourceUrl,
  }]));

  return deck.map(card => {
    const current = images.get(normalizedName(card.name));
    if (!current?.imageUrl) return card;
    return { ...card, ...current };
  });
}
