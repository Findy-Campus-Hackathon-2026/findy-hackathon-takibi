// ============================================================
// 🎨 アセット設定ファイル
//
// 焚き火・ユーザーアバターの画像をここで一元管理します。
// カスタム画像に差し替えたい場合は、このファイルだけ変更すればOKです。
//
// 画像の配置場所:
//   public/images/bonfire/  ← 焚き火画像
//   public/images/avatars/  ← アバター画像
//
// 画像が null の場合は、SVGコードで描画したデフォルトが使われます。
// ============================================================

/**
 * 焚き火画像の設定
 *
 * - null     → SVGコードで描画したアニメーション炎を使用（デフォルト）
 * - string   → 指定したパスの画像を表示（PNG/WebP/SVG対応）
 *
 * @example
 *   // カスタム画像を使う場合:
 *   export const BONFIRE_IMAGE: string | null = '/images/bonfire/bonfire.png';
 */
export const BONFIRE_IMAGE: string | null = null;

/**
 * 焚き火画像の表示サイズ (px)
 * 画像を使う場合のみ有効。SVG描画時は無視されます。
 */
export const BONFIRE_IMAGE_SIZE = {
    width: 140,
    height: 160,
} as const;

// ------------------------------------------------------------

/**
 * ユーザーアバター画像の設定
 *
 * - null     → 絵文字+カラー円のデフォルトアバターを使用
 * - string   → 全ユーザー共通のデフォルト画像パス
 *
 * 個別ユーザーの画像は User.avatarImageUrl で上書き可能です（優先度: 高）
 *
 * @example
 *   // 全ユーザー共通のデフォルト画像:
 *   export const DEFAULT_AVATAR_IMAGE: string | null = '/images/avatars/default.png';
 */
export const DEFAULT_AVATAR_IMAGE: string | null = null;

/**
 * アバター画像の表示サイズ (直径 px)
 * avatarSize prop や AVATAR_SIZE に合わせた係数で実際のサイズが決まります。
 */
export const AVATAR_IMAGE_SCALE = 2.0; // アバター半径 × この値 = 画像の一辺

// ------------------------------------------------------------

/**
 * 画像が有効かどうかを判定するユーティリティ
 */
export function hasValidImage(src: string | null | undefined): src is string {
    return typeof src === 'string' && src.trim().length > 0;
}
