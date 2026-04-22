import React, { useState } from 'react';
import type { User } from '../types';
import type { ProfileUpdate } from '../hooks/useUsers';
import { SKIN_COLORS, HAIR_COLORS, DOT_PATTERNS, CLOTHES_COLORS } from '../config/avatarPixelConfig';
import PixelAvatar from './PixelAvatar';

interface SettingsPanelProps {
    user: User;
    onSave: (attrs: ProfileUpdate) => void;
    onClose: () => void;
}

function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ user, onSave, onClose }) => {
    const hash = simpleHash(user.id);

    const [name, setName] = useState(user.name);
    const [skinColor, setSkinColor] = useState(
        user.skinColor || SKIN_COLORS[hash % SKIN_COLORS.length],
    );
    const [hairColor, setHairColor] = useState(
        user.hairColor || HAIR_COLORS[(hash >> 4) % HAIR_COLORS.length],
    );
    const [clothesColor, setClothesColor] = useState(user.avatarColor);
    const patternIndex = (hash >> 8) % DOT_PATTERNS.length;

    const handleSave = () => {
        const updates: ProfileUpdate = {};
        const trimmed = name.trim();
        if (trimmed && trimmed !== user.name) updates.name = trimmed;
        if (skinColor !== (user.skinColor || SKIN_COLORS[hash % SKIN_COLORS.length]))
            updates.skinColor = skinColor;
        if (hairColor !== (user.hairColor || HAIR_COLORS[(hash >> 4) % HAIR_COLORS.length]))
            updates.hairColor = hairColor;
        if (clothesColor !== user.avatarColor)
            updates.avatarColor = clothesColor;

        if (Object.keys(updates).length > 0) {
            onSave(updates);
        }
        onClose();
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <span className="settings-title">プロフィール</span>
                    <button className="settings-close" onClick={onClose} aria-label="閉じる">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="settings-preview">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                        <g transform="translate(48, 48)">
                            <PixelAvatar
                                skinColor={skinColor}
                                hairColor={hairColor}
                                clothesColor={clothesColor}
                                size={84}
                                patternIndex={patternIndex}
                            />
                        </g>
                    </svg>
                </div>

                <label className="settings-label">なまえ</label>
                <input
                    className="settings-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={10}
                    autoComplete="off"
                />

                <label className="settings-label">はだの色</label>
                <div className="settings-swatches">
                    {SKIN_COLORS.map((c) => (
                        <button
                            key={c}
                            className={`settings-swatch${skinColor === c ? ' active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setSkinColor(c)}
                            aria-label={c}
                        />
                    ))}
                </div>

                <label className="settings-label">かみの色</label>
                <div className="settings-swatches">
                    {HAIR_COLORS.map((c) => (
                        <button
                            key={c}
                            className={`settings-swatch${hairColor === c ? ' active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setHairColor(c)}
                            aria-label={c}
                        />
                    ))}
                </div>

                <label className="settings-label">ふくの色</label>
                <div className="settings-swatches">
                    {CLOTHES_COLORS.map((c) => (
                        <button
                            key={c}
                            className={`settings-swatch${clothesColor === c ? ' active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setClothesColor(c)}
                            aria-label={c}
                        />
                    ))}
                </div>

                <button className="settings-save-btn" onClick={handleSave}>
                    できた！
                </button>
            </div>
        </div>
    );
};

export default SettingsPanel;
