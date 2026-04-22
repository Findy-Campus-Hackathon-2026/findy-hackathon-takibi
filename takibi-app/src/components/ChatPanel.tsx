import React from 'react';

interface ChatPanelProps {
	messages: any[]; // 使用しない
	currentUserId: string | null;
	onSend: (body: string) => void;
	hasJoined: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
	hasJoined,
}) => {
	if (!hasJoined) return null;

	return (
		<div className="chat-panel">
			<div className="chat-messages">
				<div className="chat-msg chat-msg--system">
					<span className="chat-msg-body">チャット機能は準備中です。</span>
				</div>
			</div>

			<div className="chat-input-form">
				<input
					className="chat-input"
					type="text"
					value=""
					placeholder="準備中..."
					disabled
				/>
				<button
					className="chat-send-btn"
					type="submit"
					disabled
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
			</div>
		</div>
	);
};

export default ChatPanel;
