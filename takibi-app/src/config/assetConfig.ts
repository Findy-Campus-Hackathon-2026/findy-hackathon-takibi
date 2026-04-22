// ============================================================
// 🎨 アセット設定ファイル
//
// 焚き火・ユーザーアバターの画像をここで一元管理します。
// カスタム画像に差し替えたい場合は、このファイルだけ変更すればOKです。
//
// 画像の配置場所:
//   src/assets/bonfire/  ← 焚き火画像
//   public/images/avatars/  ← アバター画像
// ============================================================

import takibi01 from '../assets/bonfire/takibi01.png';
import takibi02 from '../assets/bonfire/takibi02.png';
import takibi03 from '../assets/bonfire/takibi03.png';

/**
 * 焚き火アニメーションフレーム
 *
 * 配列に複数枚の画像パスを並べると、順番にループ再生してアニメーションになります。
 * - 1枚だけ → 静止画
 * - 複数枚  → パラパラ漫画アニメーション（炎が動いて見える）
 * - 空配列  → SVGコードで描画したパーティクル炎にフォールバック
 */
export const BONFIRE_FRAMES: string[] = [
    takibi01,
    takibi02,
    takibi03,
];

/**
 * フレーム切り替え間隔 (ミリ秒)
 * 小さいほど速くなる。100〜150ms が自然な炎の揺らぎに見える。
 */
export const BONFIRE_FRAME_INTERVAL_MS = 350;

/**
 * 焚き火画像の表示サイズ (px)
 * 画像を使う場合のみ有効。SVG描画時は無視されます。
 */
export const BONFIRE_IMAGE_SIZE = {
    width: 120,
    height: 150,
} as const;

// ------------------------------------------------------------

/**
 * ユーザーアバター画像の設定
 *
 * - null     → 絵文字+カラー円のデフォルトアバターを使用
 * - string   → 全ユーザー共通のデフォルト画像パス
 *
 * 個別ユーザーの画像は User.avatarImageUrl で上書き可能です（優先度: 高）
 */
export const DEFAULT_AVATAR_IMAGE: string | null = null;

/**
 * アバター画像の表示サイズ係数
 * アバター半径 × この値 = 画像の一辺 (px)
 */
export const AVATAR_IMAGE_SCALE = 2.0;

// ------------------------------------------------------------

/**
 * 画像が有効かどうかを判定するユーティリティ
 */
export function hasValidImage(src: string | null | undefined): src is string {
    return typeof src === 'string' && src.trim().length > 0;
}
