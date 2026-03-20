import React from 'react';

interface JoinButtonProps {
    onClick: () => void;
    hasJoined: boolean;
}

/**
 * 「焚き火を囲む」参加ボタン
 */
const JoinButton: React.FC<JoinButtonProps> = ({ onClick, hasJoined }) => {
    if (hasJoined) {
        return (
            <div id="join-status" className="join-status">
                🔥 焚き火を囲んでいます
            </div>
        );
    }

    return (
        <button
            id="join-btn"
            className="join-btn"
            onClick={onClick}
            aria-label="焚き火を囲む"
        >
            <span className="join-btn-icon">🔥</span>
            <span className="join-btn-text">焚き火を囲む</span>
        </button>
    );
};

export default JoinButton;
