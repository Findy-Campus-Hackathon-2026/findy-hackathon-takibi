import { useState, useEffect, useRef } from 'react';
import { BONFIRE_FRAMES, BONFIRE_FRAME_INTERVAL_MS } from '../config/assetConfig';

/**
 * 焚き火フレームアニメーションフック
 *
 * BONFIRE_FRAMES に並べた画像を順番にループ再生し、
 * 現在表示すべき画像URLを返します。
 *
 * @returns 現在フレームの画像URL（フレームなし → null）
 */
export function useBonfireFrames(): string | null {
    const [frameIndex, setFrameIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (BONFIRE_FRAMES.length <= 1) return; // 1枚以下はアニメ不要

        intervalRef.current = setInterval(() => {
            setFrameIndex((prev) => (prev + 1) % BONFIRE_FRAMES.length);
        }, BONFIRE_FRAME_INTERVAL_MS);

        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
        };
    }, []);

    if (BONFIRE_FRAMES.length === 0) return null;
    return BONFIRE_FRAMES[frameIndex];
}
