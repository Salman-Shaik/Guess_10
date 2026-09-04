import { useMemo, useState } from 'react';
import { CategoryKey, Deck } from '../lib/types';

type DeckImporterProps = { category: CategoryKey; onImported: (deck: Deck) => void };

function isDeck(value: unknown): value is Deck {
  return Array.isArray(value) && value.length > 0 && value.every(card => {
    if (!card || typeof card !== 'object') return false;
    const item = card as Record<string, unknown>;
    const info = item.icon_info as Record<string, unknown> | undefined;
    return typeof item.name === 'string'
      && Array.isArray(item.buzzwords) && item.buzzwords.length === 3 && item.buzzwords.every(word => typeof word === 'string')
      && Array.isArray(item.clues) && item.clues.length >= 3 && item.clues.every(clue => typeof clue === 'string')
      && Boolean(info) && ['starTag', 'placeOfBirth', 'highestAward', 'alsoKnownFor'].every(key => typeof info?.[key] === 'string');
  });
}

function buildPrompt(topic: string) {
  return `Create a factually accurate Mystery Card Night game deck about "${topic || '[YOUR CATEGORY]'}".

Return ONLY valid JSON. Do not use Markdown or add commentary. Create 100 unique cards, ordered from easy to hard. Every card must follow this exact structure:

[
  {
    "name": "Answer players must guess",
    "buzzwords": ["short hardest or vague association 1", "short harder association 2", "short easy association 3"],
    "clues": ["specific clue 1", "specific clue 2", "specific clue 3"],
    "icon_info": {
      "starTag": "famous title, nickname, or defining trait",
      "placeOfBirth": "origin, location, or discovery place",
      "highestAward": "a notable verified award, achievement, or distinction",
      "alsoKnownFor": "another notable fact"
    },
    "bonus_question": "A short timed bonus challenge related to the answer",
    "bonus_answer": "A concise example answer",
    "imageUrl": "A direct HTTPS image-file URL",
    "imageSourceUrl": "The HTTPS page where the image and its attribution can be verified"
  }
]

Rules:
- Use exactly 3 buzzwords and at least 3 useful clues per card.
- Do not repeat the answer inside its buzzwords or clues.
- Keep clues family-friendly, concise, unambiguous, and progressively revealing.
- Verify names, places, awards, and answers. Do not invent facts.
- Prefer a reputable source suited to the category, such as Wikimedia Commons/Wikipedia for general topics, PokeAPI for Pokémon, TMDB for films, or Fandom when it permits direct image embedding.
- imageUrl must load the image itself, not an HTML profile page. imageSourceUrl must link to the exact source/profile page.
- Test that imageUrl returns an image successfully and does not block hotlinking; do not put Markdown links in either URL field.
- Use a unique, correctly matched portrait for every card; never reuse a placeholder image across people.
- Use plain double quotes and valid JSON with no trailing commas.
- Keep every field, even when its value must be "Not applicable".`;
}

export function DeckImporter({ category, onImported }: DeckImporterProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'prompt' | 'import'>('prompt');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(topic), [topic]);
  const storageKey = `deck-${category}-all`;

  function save() {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!isDeck(parsed)) throw new Error('Each card needs a name, exactly 3 buzzwords, at least 3 clues, and all four icon-info fields.');
      localStorage.setItem(storageKey, JSON.stringify(parsed));
      onImported(parsed);
      setOpen(false);
      setText('');
      window.alert(`Imported ${parsed.length} cards.`);
    } catch (error: unknown) {
      window.alert(`Could not import deck: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openImporter() {
    setText(localStorage.getItem(storageKey) ?? '');
    setOpen(true);
  }

  return (
    <div className="gi10-import">
      <button className="btn secondary" onClick={openImporter}>Create or import deck</button>
      {open && (
        <div className="gi10-modal" role="dialog" aria-modal="true" aria-labelledby="deck-dialog-title">
          <div className="gi10-modal__dialog deck-dialog">
            <div className="gi10-modal__head">
              <div><span className="eyebrow">Custom deck studio</span><div className="title" id="deck-dialog-title">Build your own category</div></div>
              <button className="btn ghost" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-tabs" role="tablist">
              <button className={tab === 'prompt' ? 'is-active' : ''} onClick={() => setTab('prompt')}>1. Generate with AI</button>
              <button className={tab === 'import' ? 'is-active' : ''} onClick={() => setTab('import')}>2. Import JSON</button>
            </div>

            {tab === 'prompt' ? (
              <div className="prompt-builder">
                <label className="gi10-label" htmlFor="deck-topic">Your category</label>
                <input id="deck-topic" className="input" value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. World Football Legends" />
                <div className="prompt-preview"><pre>{prompt}</pre></div>
                <div className="gi10-modal__actions">
                  <button className="btn secondary" onClick={() => setTab('import')}>I already have JSON</button>
                  <button className="btn" onClick={copyPrompt}>{copied ? 'Copied!' : 'Copy LLM prompt'}</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="modal-help">Paste the raw JSON array returned by your AI tool. We validate its structure before saving it.</p>
                <textarea className="gi10-textarea" placeholder='[{ "name": "...", "buzzwords": [...] }]' value={text} onChange={event => setText(event.target.value)} />
                <div className="gi10-modal__actions">
                  <button className="btn secondary" onClick={() => setTab('prompt')}>Back to prompt</button>
                  <button className="btn" onClick={save} disabled={!text.trim()}>Validate & import</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
