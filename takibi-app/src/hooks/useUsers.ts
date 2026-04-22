import { useState, useCallback } from 'react';
import type { User, AppState } from '../types';
import { SKIN_COLORS, HAIR_COLORS, CLOTHES_COLORS } from '../config/avatarPixelConfig';

// ボットユーザーの定義
function createBotUser(id: string, name: string, emoji: string, joinedOffset: number): User {
	return {
		id,
		joinedAt: Date.now() - joinedOffset,
		angle: 0,
		radius: 120,
		avatarColor: CLOTHES_COLORS[Math.floor(Math.random() * CLOTHES_COLORS.length)],
		avatarEmoji: emoji,
		name,
		skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
		hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
	};
}

const BOT_USERS: User[] = [
	createBotUser('bot-1', 'Bot-chan', '🤖', 300000),
	createBotUser('bot-2', 'Fox Bot', '🦊', 180000),
	createBotUser('bot-3', 'Wolf Bot', '🐺', 60000),
];

/**
 * ユーザーを円形に均等配置する角度を計算
 */
export function calcUserAngle(index: number, total: number): number {
	return (360 / total) * index;
}

export interface ProfileUpdate {
	name?: string;
	skinColor?: string;
	hairColor?: string;
	avatarColor?: string;
}

export function useUsers(): AppState & {
	addSelf: () => void;
	sendMessage: (body: string) => void;
	updateProfile: (attrs: ProfileUpdate) => void;
} {
	const [state, setState] = useState<AppState>({
		users: BOT_USERS,
		currentUserId: null,
		onlineCount: BOT_USERS.length,
		isConnected: true,
		messages: [],
	});

	const addSelf = useCallback(() => {
		if (state.currentUserId) return;
		const newUser: User = {
			id: `user-${Date.now()}`,
			joinedAt: Date.now(),
			angle: 0, // 後で再計算
			radius: 120,
			avatarColor: '#FF5722',
			avatarEmoji: '👤',
			name: 'You',
			skinColor: '#FFB74D',
			hairColor: '#F57C00',
		};
		setState((prev) => ({
			...prev,
			users: [...prev.users, newUser],
			currentUserId: newUser.id,
			onlineCount: prev.users.length + 1,
		}));
	}, [state.currentUserId]);

	const sendMessage = useCallback((_body: string) => {
		// チャットは準備中なので、何もしない
	}, []);

	const updateProfile = useCallback((attrs: ProfileUpdate) => {
		if (!state.currentUserId) return;
		setState((prev) => ({
			...prev,
			users: prev.users.map((u) =>
				u.id === prev.currentUserId ? { ...u, ...attrs } : u,
			),
		}));
	}, [state.currentUserId]);

	return { ...state, addSelf, sendMessage, updateProfile };
}
