import { useState, useEffect, useRef } from 'react';
import type { FlameParticle } from '../types';

const FLAME_COLORS = [
    '#FFF176', // 中心の白っぽい黄色
    '#FFD54F', // 明るい黄色
    '#FF8F00', // オレンジ
    '#F57C00', // 濃いオレンジ
    '#E64A19', // 赤オレンジ
    '#BF360C', // 深い赤
];

let particleIdCounter = 0;

function createParticle(centerX: number, centerY: number): FlameParticle {
    const spread = 18;
    return {
        id: particleIdCounter++,
        x: centerX + (Math.random() - 0.5) * spread,
        y: centerY,
        size: 6 + Math.random() * 18,
        opacity: 0.8 + Math.random() * 0.2,
        speedY: -(1.5 + Math.random() * 3),
        speedX: (Math.random() - 0.5) * 0.8,
        color: FLAME_COLORS[Math.floor(Math.random() * FLAME_COLORS.length)],
        life: 1.0,
    };
}

/**
 * 炎パーティクルアニメーションフック
 * @param centerX 炎の中心X座標
 * @param centerY 炎の中心Y座標 (ベース位置)
 * @param intensity 炎の強さ (1.0 = 標準)
 */
export function useFlame(centerX: number, centerY: number, intensity = 1.0) {
    const [particles, setParticles] = useState<FlameParticle[]>([]);
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        const SPAWN_RATE = Math.floor(3 / intensity); // フレーム何枚に1回生成するか
        let frameCount = 0;

        function tick(timestamp: number) {
            const dt = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            // dtが大きすぎる場合(タブ非アクティブから復帰)はスキップ
            if (dt > 200) {
                animationRef.current = requestAnimationFrame(tick);
                return;
            }

            frameCount++;

            setParticles((prev) => {
                // 既存パーティクルを更新
                const updated = prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.speedX,
                        y: p.y + p.speedY,
                        life: p.life - 0.018,
                        opacity: p.life * 0.9,
                        size: p.size * (0.97 + p.life * 0.02),
                    }))
                    .filter((p) => p.life > 0);

                // 新規パーティクルを追加
                if (frameCount % SPAWN_RATE === 0) {
                    const newCount = Math.ceil(intensity * 2);
                    const newParticles = Array.from({ length: newCount }, () =>
                        createParticle(centerX, centerY)
                    );
                    return [...updated, ...newParticles].slice(-80); // 最大80個
                }

                return updated;
            });

            animationRef.current = requestAnimationFrame(tick);
        }

        animationRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationRef.current);
    }, [centerX, centerY, intensity]);

    return particles;
}
