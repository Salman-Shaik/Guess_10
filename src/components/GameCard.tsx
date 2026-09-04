import { useEffect, useState } from 'react';
import { CardItem } from '../lib/types';
import { IconInfoGrid } from './IconInfoGrid';

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '').join('');
}

type GameCardProps = {
  card: CardItem;
  buzzToTell: 2 | 3;
  clueUsed: boolean;
  canUseClue: boolean;
  onUseClue: () => void;
};

export function GameCard({ card, buzzToTell, clueUsed, canUseClue, onUseClue }: GameCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(card.imageUrl && card.imageUrl !== 'null') && !imageFailed;

  useEffect(() => setImageFailed(false), [card.imageUrl]);

  return (
    <div className="gi10-card">
      <div className="gi10-actor">
        <div className="gi10-actor__artwork">
          <div className="gi10-actor__avatar">
            {hasImage ? (
              <img className="gi10-actor__img" src={card.imageUrl} alt={card.name} onError={() => setImageFailed(true)} />
            ) : (
              <div className="gi10-actor__placeholder" aria-hidden="true">{initials(card.name)}</div>
            )}
          </div>
          {card.imageSourceUrl && (
            <a className="image-credit" href={card.imageSourceUrl} target="_blank" rel="noreferrer">View image source ↗</a>
          )}
        </div>

        <div className="gi10-actor__content">
          <div className="gi10-actor__heading">
            <div className="gi10-actor__meta">
              <div className="gi10-actor__name">{card.name}</div>
            </div>
            <button className="btn secondary" onClick={onUseClue} disabled={!canUseClue}>
              {clueUsed ? 'Clue Used' : 'Use Team Clue'}
            </button>
          </div>

          <div className="gi10-actor__buzzwords">
            <div className="label">Say these buzzwords</div>
            <div className="chips">
              {card.buzzwords.map((buzzword, index) => {
                const allowed = index < buzzToTell;
                return (
                  <span key={index} className={`chip ${allowed ? 'is-allowed' : 'is-locked'}`}
                    title={allowed ? 'Allowed to tell' : 'Locked until bonus steal'}
                    aria-label={allowed ? 'Allowed to tell' : 'Locked until bonus steal'}>
                    {buzzword}
                    {!allowed && <span className="chip__badge">LOCKED</span>}
                  </span>
                );
              })}
            </div>
            <div className="mini">
              {buzzToTell === 2 ? 'Third buzzword is locked until earned by a correct bonus.' : 'All three buzzwords are unlocked.'}
            </div>
          </div>

          <div className="gi10-actor__info">
            <div className="label">Icon Info</div>
            <IconInfoGrid info={card.icon_info} />
          </div>
        </div>
      </div>

      <div className="gi10-card__section">
        <div className="label">Clues to reveal</div>
        <ul className="clues">
          {card.clues.map((clue, index) => <li key={index} className="clue">{clue}</li>)}
        </ul>
      </div>
    </div>
  );
}
