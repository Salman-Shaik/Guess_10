import React from 'react';
import { TeamKey } from '../lib/types';


export function Controls(
    { onShuffle, onSkip, onIncQ, onDecQ, qDisabled, currentTeam, onSwitchTeam }:
        { onShuffle: () => void; onSkip: () => void; onIncQ: () => void; onDecQ: () => void; qDisabled: boolean; currentTeam: TeamKey; onSwitchTeam: () => void }
) {
    return (
        <div className="gi10-controls">
            <button className="btn secondary" onClick={onShuffle}>Shuffle Deck</button>
            <button className="btn secondary" onClick={onSkip}>Skip Card</button>
            <div className="spacer" />
            <div className="gi10-qcounter">
                <span className="label">Questions</span>
                <button className="btn secondary" onClick={onDecQ}>-</button>
                <button className="btn" onClick={onIncQ} disabled={qDisabled}>+1</button>
            </div>
            <div className="spacer" />
            <button className="btn secondary" onClick={onSwitchTeam}>Switch Turn ({currentTeam === 'teamA' ? 'A→B' : 'B→A'})</button>
        </div>
    );
}