import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
    messages: ChatMessage[];
    currentUserId: string | null;
    onSend: (body: string) => void;
    hasJoined: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    currentUserId,
    onSend,
    hasJoined,
}) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 新着メッセージで自動スクロール
    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    if (!hasJoined) return null;

    return (
        <div className="chat-panel">
            {/* メッセージ一覧 */}
            <div className="chat-messages" ref={scrollRef}>
                {messages.map((msg) => {
                    const isSelf = msg.userId === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`chat-msg ${isSelf ? 'chat-msg--self' : ''}`}
                        >
                            {!isSelf && (
                                <span
                                    className="chat-msg-name"
                                    style={{ color: msg.avatarColor }}
                                >
                                    {msg.userName}
                                </span>
                            )}
                            <span className="chat-msg-body">{msg.body}</span>
                        </div>
                    );
                })}
            </div>

            {/* 入力欄 */}
            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    className="chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="メッセージを送る..."
                    maxLength={200}
                    autoComplete="off"
                />
                <button
                    className="chat-send-btn"
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="送信"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M5 12L3 3l19 9-19 9 2-9zm0 0h9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
