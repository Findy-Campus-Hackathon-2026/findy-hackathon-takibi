import React from 'react';
import type { User } from '../types';
import { DEFAULT_AVATAR_IMAGE, AVATAR_IMAGE_SCALE, hasValidImage } from '../config/assetConfig';

interface UserAvatarProps {
    user: User;
    centerX: number;
    centerY: number;
    isSelf?: boolean;
}

/**
 * ユーザーアバターコンポーネント
 * 焚き火の周りの円軌道上に配置される
 *
 * ## アバター画像差し替え方法（3通り）
 *
 * ### 方法 A: 全ユーザー共通の画像（グローバル設定）
 *   `src/config/assetConfig.ts` の DEFAULT_AVATAR_IMAGE に画像パスをセット
 *
 * ### 方法 B: ユーザー個別の画像
 *   バックエンドから受け取る User オブジェクトの avatarImageUrl フィールドに画像URLをセット
 *   （個別URLが最優先で表示されます）
 *
 * ### 方法 C: どちらもnull → 絵文字+カラー円のデフォルトにフォールバック
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
    user,
    centerX,
    centerY,
    isSelf = false,
}) => {
    const rad = (user.angle * Math.PI) / 180;
    const x = centerX + Math.cos(rad) * user.radius;
    const y = centerY + Math.sin(rad) * user.radius;

    const AVATAR_SIZE = isSelf ? 26 : 22;
    const GLOW_SIZE = AVATAR_SIZE + 8;

    // ---------------------------------------------------
    // 優先度: user.avatarImageUrl > DEFAULT_AVATAR_IMAGE > 絵文字
    // ---------------------------------------------------
    const resolvedAvatarImage =
        hasValidImage(user.avatarImageUrl) ? user.avatarImageUrl
            : hasValidImage(DEFAULT_AVATAR_IMAGE) ? DEFAULT_AVATAR_IMAGE
                : null;

    const useImage = resolvedAvatarImage !== null;
    const imgSize = AVATAR_SIZE * AVATAR_IMAGE_SCALE;
    // clipPath用ID（SVGはグローバルスコープなのでユーザーIDで一意にする）
    const clipId = `avatar-clip-${user.id}`;

    return (
        <g
            id={`user-${user.id}`}
            transform={`translate(${x}, ${y})`}
            style={{ cursor: 'default' }}
        >
            {/* ===== clipPath定義（画像を円形にクリップ） ===== */}
            {useImage && (
                <defs>
                    <clipPath id={clipId}>
                        <circle r={AVATAR_SIZE} />
                    </clipPath>
                </defs>
            )}

            {/* ===== 自分の強調グロー ===== */}
            {isSelf && (
                <circle
                    r={GLOW_SIZE}
                    fill={user.avatarColor}
                    opacity={0.25}
                    className="self-glow-pulse"
                />
            )}

            {/* ===== 焚き火の光を受けた影（足元） ===== */}
            <ellipse
                cx={0}
                cy={AVATAR_SIZE + 2}
                rx={AVATAR_SIZE * 0.6}
                ry={4}
                fill="#FF8F00"
                opacity={0.18}
            />

            {useImage ? (
                /* ===== 画像アバターモード ===== */
                <>
                    {/* 外周リング */}
                    <circle
                        r={AVATAR_SIZE}
                        fill="transparent"
                        stroke={isSelf ? '#FFF9C4' : 'rgba(255,255,255,0.3)'}
                        strokeWidth={isSelf ? 2.5 : 1}
                    />
                    {/* 画像（円クリップ） */}
                    <image
                        href={resolvedAvatarImage as string}
                        x={-imgSize / 2}
                        y={-imgSize / 2}
                        width={imgSize}
                        height={imgSize}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#${clipId})`}
                    />
                </>
            ) : (
                /* ===== 絵文字アバターモード（デフォルト） ===== */
                <>
                    {/* アバター背景円 */}
                    <circle
                        r={AVATAR_SIZE}
                        fill={user.avatarColor}
                        opacity={0.9}
                        stroke={isSelf ? '#FFF9C4' : 'rgba(255,255,255,0.3)'}
                        strokeWidth={isSelf ? 2.5 : 1}
                    />
                    {/* 絵文字 */}
                    <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={AVATAR_SIZE * 1.0}
                        style={{ userSelect: 'none' }}
                    >
                        {user.avatarEmoji}
                    </text>
                </>
            )}

            {/* ===== 名前ラベル ===== */}
            <text
                y={AVATAR_SIZE + 14}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,220,180,0.85)"
                fontFamily="'Noto Sans JP', sans-serif"
                style={{ userSelect: 'none' }}
            >
                {isSelf ? 'あなた' : user.name}
            </text>
        </g>
    );
};

export default UserAvatar;
