import React from 'react';
import { CategoryKey } from '../lib/types';


export function CategoryPicker({ value, onChange, categories }: { value: CategoryKey; onChange: (c: CategoryKey) => void; categories: { key: CategoryKey; label: string }[] }
) {
    return (
        <div className="gi10-panel">
            <label className="gi10-label">Category</label>
            <div className="gi10-seg">
                {categories.map(c => (
                    <button key={c.key} className={`gi10-seg__btn ${value === c.key ? 'is-active' : ''}`} onClick={() => onChange(c.key)}>{c.label}</button>
                ))}
            </div>
        </div>
    );
}