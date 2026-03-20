import { useState, useEffect, useCallback, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';
import type { User, ChatMessage, AppState } from '../types';

const CABLE_URL = 'ws://localhost:3000/cable';
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
            received(data: Record<string, unknown>) {
                switch (data.type) {
                    case 'welcome':
                        setState((prev) => ({
                            ...prev,
                            currentUserId: data.userId as string,
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
