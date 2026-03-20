import React from 'react';
import { useFlame } from '../hooks/useFlame';
import { BONFIRE_IMAGE, BONFIRE_IMAGE_SIZE, hasValidImage } from '../config/assetConfig';

interface BonfireProps {
    cx: number;  // キャンバス上の中心X
    cy: number;  // キャンバス上の中心Y
    /**
     * カスタム焚き火画像URL（オプション）
     * - 指定あり → この画像を優先表示（SVGアニメーション炎は非表示）
     * - 未指定   → assetConfig.ts の BONFIRE_IMAGE を参照
     * - どちらもnull → SVGコードで描画したアニメーション炎を使用
     */
    imageSrc?: string | null;
}

/**
 * 焚き火コンポーネント
 *
 * ## 画像差し替え方法（2通り）
 *
 * ### 方法 A: グローバル設定（推奨）
 *   `src/config/assetConfig.ts` の BONFIRE_IMAGE に画像パスをセット
 *   → アプリ全体で一括切り替え
 *
 * ### 方法 B: Props経由
 *   <Bonfire cx={cx} cy={cy} imageSrc="/images/bonfire/bonfire.png" />
 *   → 特定の箇所だけ別画像にしたい場合
 */
const Bonfire: React.FC<BonfireProps> = ({ cx, cy, imageSrc }) => {
    // 優先度: prop > assetConfig > SVGデフォルト
    const resolvedSrc = imageSrc !== undefined ? imageSrc : BONFIRE_IMAGE;
    const useImage = hasValidImage(resolvedSrc);

    // SVGデフォルト描画の場合のみパーティクルを生成
    const particles = useFlame(cx, cy - 10, useImage ? 0 : 1.4);

    // ========================================
    // 画像モード
    // ========================================
    if (useImage) {
        const imgW = BONFIRE_IMAGE_SIZE.width;
        const imgH = BONFIRE_IMAGE_SIZE.height;
        return (
            <g id="bonfire">
                {/* 地面グロー（画像の下に敷く） */}
                <ellipse
                    cx={cx}
                    cy={cy + 18}
                    rx={70}
                    ry={14}
                    fill="url(#groundGlow)"
                    opacity={0.5}
                />
                {/* カスタム画像 */}
                <image
                    href={resolvedSrc as string}
                    x={cx - imgW / 2}
                    y={cy - imgH * 0.75}  // 画像の下端を基点（地面付近）に合わせる
                    width={imgW}
                    height={imgH}
                    preserveAspectRatio="xMidYMid meet"
                />
            </g>
        );
    }

    // ========================================
    // SVGデフォルト描画モード（パーティクル炎）
    // ========================================
    return (
        <g id="bonfire">
            {/* ===== 地面の光 (ラジアルグロー) ===== */}
            <ellipse
                cx={cx}
                cy={cy + 18}
                rx={70}
                ry={14}
                fill="url(#groundGlow)"
                opacity={0.5}
            />

            {/* ===== 薪 ===== */}
            {/* 左薪 */}
            <rect
                x={cx - 42}
                y={cy + 8}
                width={48}
                height={10}
                rx={5}
                fill="#5D4037"
                transform={`rotate(-20, ${cx - 20}, ${cy + 13})`}
            />
            {/* 右薪 */}
            <rect
                x={cx - 6}
                y={cy + 8}
                width={48}
                height={10}
                rx={5}
                fill="#4E342E"
                transform={`rotate(20, ${cx + 20}, ${cy + 13})`}
            />
            {/* 手前薪 */}
            <rect
                x={cx - 28}
                y={cy + 14}
                width={56}
                height={9}
                rx={4}
                fill="#3E2723"
            />

            {/* ===== 炭・熾火 ===== */}
            <ellipse cx={cx} cy={cy + 16} rx={24} ry={7} fill="#E64A19" opacity={0.7} />
            <ellipse cx={cx - 8} cy={cy + 15} rx={10} ry={4} fill="#FF8F00" opacity={0.6} />
            <ellipse cx={cx + 9} cy={cy + 16} rx={8} ry={3} fill="#FFD54F" opacity={0.5} />

            {/* ===== 炎パーティクル ===== */}
            {particles.map((p) => (
                <ellipse
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    rx={p.size * 0.45}
                    ry={p.size * 0.7}
                    fill={p.color}
                    opacity={p.opacity}
                    style={{ filter: 'blur(1.5px)' }}
                />
            ))}

            {/* ===== コア炎 (静的でいつもある明るい芯) ===== */}
            <ellipse cx={cx} cy={cy} rx={12} ry={22} fill="#FFF9C4" opacity={0.85} />
            <ellipse cx={cx} cy={cy + 6} rx={18} ry={16} fill="#FFE082" opacity={0.7} />
            <ellipse cx={cx} cy={cy + 10} rx={22} ry={12} fill="#FFB300" opacity={0.5} />
        </g>
    );
};

export default Bonfire;
