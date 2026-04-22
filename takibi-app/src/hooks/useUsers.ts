import { useState, useCallback } from 'react';
import type { User, AppState } from '../types';

// ボットユーザーの定義
const BOT_USERS: User[] = [
    {
        id: 'bot-1',
        joinedAt: Date.now() - 300000, // 5分前
        angle: 0,
        radius: 120,
        avatarColor: '#FF8F00',
        avatarEmoji: '🤖',
        name: 'Bot-chan',
        skinColor: '#FFD54F',
        hairColor: '#FF6D00',
    },
    {
        id: 'bot-2',
        joinedAt: Date.now() - 180000, // 3分前
        angle: 0,
        radius: 120,
        avatarColor: '#4CAF50',
        avatarEmoji: '🦊',
        name: 'Fox Bot',
        skinColor: '#81C784',
        hairColor: '#388E3C',
    },
    {
        id: 'bot-3',
        joinedAt: Date.now() - 60000, // 1分前
        angle: 0,
        radius: 120,
        avatarColor: '#2196F3',
        avatarEmoji: '🐺',
        name: 'Wolf Bot',
        skinColor: '#64B5F6',
        hairColor: '#1976D2',
    },
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
