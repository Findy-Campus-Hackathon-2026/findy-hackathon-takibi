import React from 'react';
import { useBonfireFrames } from '../hooks/useBonfireFrames';
import { useFlame } from '../hooks/useFlame';
import { useSmoke } from '../hooks/useSmoke';
import { BONFIRE_FRAMES, BONFIRE_IMAGE_SIZE } from '../config/assetConfig';

interface BonfireProps {
	cx: number;  // キャンバス上の中心X
	cy: number;  // キャンバス上の中心Y
	/**
	 * 画像を使わずSVG描画を強制したい場合に true を指定（デバッグ用）
	 */
	forcesvg?: boolean;
}

/**
 * 焚き火コンポーネント
 *
 * ## 動作モード
 * - 画像モード (BONFIRE_FRAMES に画像あり):
 *     takibi01/02/03.png をループ → 炎が揺れて見える ＋ 煙エフェクト
 * - SVGモード (BONFIRE_FRAMES が空、または forcesvg=true):
 *     パーティクル炎 ＋ 煙をリアルタイム描画
 */
const Bonfire: React.FC<BonfireProps> = ({ cx, cy, forcesvg = false }) => {
	const currentFrame = useBonfireFrames();

	const useImageMode = !forcesvg && BONFIRE_FRAMES.length > 0 && currentFrame !== null;

	// 画像モードでは炎パーティクルをOFF（CPU節約）
	const flameParticles = useFlame(cx, cy - 10, useImageMode ? 0 : 1.4);

	// 煙は常に有効（画像・SVGどちらのモードでも出る）
	// 画像モードでは炎の上端あたり、SVGモードでは炎の上から煙が出る
	const smokeOriginY = useImageMode
		? cy - BONFIRE_IMAGE_SIZE.height * 0.82 + 10  // 画像上端付近
		: cy - 60;                                     // パーティクル炎の上
	const smokeParticles = useSmoke(cx, smokeOriginY, true);

	const imgW = BONFIRE_IMAGE_SIZE.width;
	const imgH = BONFIRE_IMAGE_SIZE.height;

	return (
		<g id="bonfire">
			{/* ===== 地面グロー（常に表示） ===== */}
			<ellipse
				cx={cx}
				cy={cy + 18}
				rx={useImageMode ? 90 : 70}
				ry={useImageMode ? 18 : 14}
				fill="url(#groundGlow)"
				opacity={0.55}
			/>

			{useImageMode ? (
				/* ========================================
				   画像アニメーションモード
				   ======================================== */
				<>
					{/* 全フレームを重ね、現在フレームのみ opacity:1 */}
					{BONFIRE_FRAMES.map((src) => (
						<image
							key={src}
							href={src}
							x={cx - imgW / 2}
							y={cy - imgH * 0.82}
							width={imgW}
							height={imgH}
							preserveAspectRatio="xMidYMid meet"
							opacity={src === currentFrame ? 1 : 0}
							style={{ transition: 'opacity 0.06s linear' }}
						/>
					))}
				</>
			) : (
				/* ========================================
				   SVGパーティクル描画モード（フォールバック）
				   ======================================== */
				<>
					{/* 薪 左 */}
					<rect
						x={cx - 42} y={cy + 8} width={48} height={10} rx={5}
						fill="#5D4037"
						transform={`rotate(-20, ${cx - 20}, ${cy + 13})`}
					/>
					{/* 薪 右 */}
					<rect
						x={cx - 6} y={cy + 8} width={48} height={10} rx={5}
						fill="#4E342E"
						transform={`rotate(20, ${cx + 20}, ${cy + 13})`}
					/>
					{/* 薪 手前 */}
					<rect
						x={cx - 28} y={cy + 14} width={56} height={9} rx={4}
						fill="#3E2723"
					/>

					{/* 炭・熾火 */}
					<ellipse cx={cx} cy={cy + 16} rx={24} ry={7} fill="#E64A19" opacity={0.7} />
					<ellipse cx={cx - 8} cy={cy + 15} rx={10} ry={4} fill="#FF8F00" opacity={0.6} />
					<ellipse cx={cx + 9} cy={cy + 16} rx={8} ry={3} fill="#FFD54F" opacity={0.5} />

					{/* 炎パーティクル */}
					{flameParticles.map((p) => (
						<ellipse
							key={p.id}
							cx={p.x} cy={p.y}
							rx={p.size * 0.45} ry={p.size * 0.7}
							fill={p.color}
							opacity={p.opacity}
							style={{ filter: 'blur(1.5px)' }}
						/>
					))}

					{/* コア炎（静的） */}
					<ellipse cx={cx} cy={cy} rx={12} ry={22} fill="#FFF9C4" opacity={0.85} />
					<ellipse cx={cx} cy={cy + 6} rx={18} ry={16} fill="#FFE082" opacity={0.7} />
					<ellipse cx={cx} cy={cy + 10} rx={22} ry={12} fill="#FFB300" opacity={0.5} />
				</>
			)}

			{/* ========================================
          煙エフェクト（画像・SVGどちらでも表示）
          炎より上に描画されるよう最後に配置
          ======================================== */}
			{smokeParticles.map((p) => {
				// grayness 0〜1 で白(240)〜グレー(160) を補間
				const gray = Math.round(240 - p.grayness * 80);
				const fill = `rgb(${gray},${gray},${gray})`;
				return (
					<circle
						key={p.id}
						cx={p.x}
						cy={p.y}
						r={p.radius}
						fill={fill}
						opacity={p.opacity}
						style={{ filter: `blur(${Math.round(p.radius * 0.6)}px)` }}
					/>
				);
			})}
		</g>
	);
};

export default Bonfire;
