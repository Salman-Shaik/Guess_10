import React, { useState } from 'react';
import { TeamKey } from '../lib/types';


export function BonusPanel(
    { question, answer, challenger, onResolve }:
        { question?: string; answer?: string; challenger: TeamKey; onResolve: (didAnswerCorrect: boolean) => void }
) {
    const [open, setOpen] = useState(false);
    return !question ? null : (
        <div className="gi10-bonus">
            <div className="gi10-bonus__head">
                <div className="title">Bonus Challenge — {challenger === 'teamA' ? 'Team A' : 'Team B'}</div>
                <div className="actions">
                    <button className="btn" onClick={() => setOpen(o => !o)}>{open ? 'Hide' : 'Show'} Bonus</button>
                </div>
            </div>
            {open && (
                <div className="gi10-bonus__body">
                    <div className="q">{question}</div>
                    {answer && <div className="a">Example answer: <strong>{answer}</strong></div>}
                    <div className="actions">
                        <button className="btn" onClick={() => onResolve(true)}>Mark Correct</button>
                        <button className="btn secondary" onClick={() => onResolve(false)}>Mark Incorrect</button>
                    </div>
                </div>
            )}
        </div>
    );
}