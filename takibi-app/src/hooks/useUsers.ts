import { useState, useEffect, useCallback, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';
import type { User, ChatMessage, AppState } from '../types';

// Viteプロキシ(vite.config.ts)が /cable をRails(3000)に橋渡しする。
// → 常に「今いるオリジンの /cable」に繋ぐだけでOK。
// localhost / ngrok / スマホ、どこからでも自動的にRailsへ届く。
const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
const CABLE_URL = `${wsProto}://${window.location.host}/cable`;
const MAX_MESSAGES = 50;

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
        users: [],
        currentUserId: null,
        onlineCount: 0,
        isConnected: false,
        messages: [],
    });


    const channelRef = useRef<any>(null);

    const consumerRef = useRef<any>(null);

    useEffect(() => {
        const consumer = createConsumer(CABLE_URL);
        consumerRef.current = consumer;

        const channel = consumer.subscriptions.create('BonfireChannel', {
            connected() {
                console.log('%c🔥 WebSocket Connected!', 'color: #ff8f00; font-weight: bold; font-size: 14px;');
                setState((prev) => ({ ...prev, isConnected: true }));
            },
            disconnected() {
                console.log('%c❄️ WebSocket Disconnected!', 'color: #4d96ff; font-weight: bold;');
                setState((prev) => ({ ...prev, isConnected: false }));
            },
            rejected() {
                console.error('%c🚫 WebSocket Connection Rejected!', 'color: #f44336; font-weight: bold;');
            },
            received(data: Record<string, unknown>) {
                console.log('%c📡 WS Received:', 'color: #4caf50;', data);
                switch (data.type) {

                    case 'welcome':
                        setState((prev) => ({
                            ...prev,
                            // data.userId があるとき（参加完了時）だけ更新し、
                            // 初期同期(nil)のときは今の ID を維持する
                            currentUserId: (data.userId as string) || prev.currentUserId,
                            users: data.users as User[],
                            onlineCount: (data.users as User[]).length,
                            isConnected: true,
                        }));
                        break;


                    case 'user_joined': {
                        const newUser = data.user as User;
                        setState((prev) => {
                            // 自分自身が追加済みなら無視
                            if (prev.users.some((u) => u.id === newUser.id)) return prev;
                            return {
                                ...prev,
                                users: [...prev.users, newUser],
                            };
                        });
                        break;
                    }

                    case 'user_left':
                        setState((prev) => ({
                            ...prev,
                            users: prev.users.filter((u) => u.id !== data.userId),
                        }));
                        break;

                    case 'count_update':
                        setState((prev) => ({
                            ...prev,
                            onlineCount: data.count as number,
                        }));
                        break;

                    case 'user_updated': {
                        const updated = data.user as User;
                        setState((prev) => ({
                            ...prev,
                            users: prev.users.map((u) =>
                                u.id === updated.id ? { ...u, ...updated } : u,
                            ),
                        }));
                        break;
                    }

                    case 'chat': {
                        const msg = data.message as ChatMessage;
                        setState((prev) => ({
                            ...prev,
                            messages: [...prev.messages.slice(-MAX_MESSAGES + 1), msg],
                        }));
                        break;
                    }
                }
            },
        });

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
            consumer.disconnect();
        };
    }, []);

    const addSelf = useCallback(() => {
        if (state.currentUserId) return;
        channelRef.current?.perform('join', {});
    }, [state.currentUserId]);

    const sendMessage = useCallback((body: string) => {
        const trimmed = body.trim();
        if (!trimmed || !state.currentUserId) return;
        channelRef.current?.perform('chat', { body: trimmed });
    }, [state.currentUserId]);

    const updateProfile = useCallback((attrs: ProfileUpdate) => {
        if (!state.currentUserId) return;
        channelRef.current?.perform('update_profile', attrs);
    }, [state.currentUserId]);

    return { ...state, addSelf, sendMessage, updateProfile };
}
