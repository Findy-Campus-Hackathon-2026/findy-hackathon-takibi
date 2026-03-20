import { useState, useEffect, useRef } from 'react';

/**
 * 煙パーティクル1粒の型
 */
export interface SmokeParticle {
    id: number;
    x: number;
    y: number;
    radius: number;     // 粒の半径（上昇とともに広がる）
    opacity: number;
    speedY: number;     // 上向き速度（負の値）
    speedX: number;     // 左右への漂い
    life: number;       // 0.0〜1.0（1.0 = 生まれたて）
    grayness: number;   // 0.0〜1.0（白〜濃い灰色）
}

let smokeIdCounter = 0;

function createSmokeParticle(baseX: number, baseY: number): SmokeParticle {
    return {
        id: smokeIdCounter++,
        x: baseX + (Math.random() - 0.5) * 20,
        y: baseY,
        radius: 8 + Math.random() * 10,
        opacity: 0.18 + Math.random() * 0.12,
        speedY: -(0.4 + Math.random() * 0.6),   // ゆっくり上昇
        speedX: (Math.random() - 0.5) * 0.5,    // 左右にふらふら
        life: 1.0,
        grayness: 0.3 + Math.random() * 0.5,    // 白〜グレー
    };
}

/**
 * 煙パーティクルアニメーションフック
 *
 * @param baseX  煙が発生するX座標（焚き火の炎の上あたり）
 * @param baseY  煙が発生するY座標
 * @param enabled false にすると生成停止（パフォーマンス制御用）
 */
export function useSmoke(
    baseX: number,
    baseY: number,
    enabled = true
): SmokeParticle[] {
    const [particles, setParticles] = useState<SmokeParticle[]>([]);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);

    useEffect(() => {
        if (!enabled) {
            setParticles([]);
            return;
        }

        function tick() {
            frameRef.current++;

            setParticles((prev) => {
                // 既存パーティクルを更新
                const updated = prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.speedX + Math.sin(p.life * 8) * 0.3, // 自然な揺らぎ
                        y: p.y + p.speedY,
                        radius: p.radius + 0.3,      // 上昇するにつれ広がる
                        life: p.life - 0.008,        // ゆっくり消える
                        opacity: p.life * 0.25,      // 生まれたては薄く、消えるときも薄い
                    }))
                    .filter((p) => p.life > 0);

                // 4フレームに1回、新しい煙を追加
                if (frameRef.current % 4 === 0) {
                    return [...updated, createSmokeParticle(baseX, baseY)].slice(-40); // 最大40粒
                }

                return updated;
            });

            animRef.current = requestAnimationFrame(tick);
        }

        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, [baseX, baseY, enabled]);

    return particles;
}
