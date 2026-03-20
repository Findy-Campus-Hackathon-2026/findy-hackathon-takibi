import { useState, useEffect, useCallback } from 'react';
import type { User, AppState } from '../types';

// ===========================
// モックデータ生成ユーティリティ
// NOTE: バックエンド実装後はWebSocket等に置き換える
// ===========================

const AVATAR_EMOJIS = ['🧑', '👩', '👨', '🧔', '👧', '🧒', '🧕', '🧑‍💻', '👩‍💻', '👨‍🍳'];
const AVATAR_COLORS = [
    '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
    '#C77DFF', '#FF9A3C', '#00C9A7', '#F72585',
];
const ANONYMOUS_NAMES = [
    'たびびと', 'かくれんぼ', 'ほたる', 'かぜ', 'つき',
    'ほし', 'もり', 'かわ', 'やま', 'そら',
    'うみ', 'はな', 'ゆき', 'あめ', 'くも',
];

function generateRandomUser(index: number): User {
    const angle = (360 / 8) * index + Math.random() * 20 - 10;
    const radius = 120 + Math.random() * 40;
    return {
        id: `mock-${index}-${Date.now()}`,
        joinedAt: Date.now() - Math.random() * 60000,
        angle,
        radius,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        avatarEmoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
        name: ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)],
    };
}

/**
 * ユーザーを円形に均等配置する角度を計算
 */
export function calcUserAngle(index: number, total: number): number {
    return (360 / total) * index;
}

// ===========================
// カスタムフック
// ===========================

export function useUsers(): AppState & {
    addSelf: () => void;
} {
    const [state, setState] = useState<AppState>({
        users: [],
        currentUserId: null,
        onlineCount: 0,
        isConnected: false,
    });

    /**
     * 初期モックユーザーをセット (バックエンド実装前の仮データ)
     * TODO: WebSocket接続に置き換える
     */
    useEffect(() => {
        const mockCount = Math.floor(Math.random() * 5) + 2;
        const mockUsers: User[] = Array.from({ length: mockCount }, (_, i) =>
            generateRandomUser(i)
        );

        setTimeout(() => {
            setState((prev) => ({
                ...prev,
                users: mockUsers,
                onlineCount: mockCount + 1, // +1 = 自分
                isConnected: true,
            }));
        }, 800);
    }, []);

    /**
     * 自分自身を追加する
     * TODO: バックエンド実装後はサーバーに通知し、サーバーからIDを受け取る
     */
    const addSelf = useCallback(() => {
        if (state.currentUserId) return; // 既に追加済み

        const selfId = `self-${Date.now()}`;
        const selfUser: User = {
            id: selfId,
            joinedAt: Date.now(),
            angle: Math.random() * 360,
            radius: 130 + Math.random() * 30,
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            avatarEmoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
            name: 'あなた',
        };

        setState((prev) => ({
            ...prev,
            users: [...prev.users, selfUser],
            currentUserId: selfId,
            onlineCount: prev.onlineCount + 1,
        }));
    }, [state.currentUserId]);

    return { ...state, addSelf };
}
