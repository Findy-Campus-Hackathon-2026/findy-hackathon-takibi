import React from 'react';
import type { User } from '../types';
import { DEFAULT_AVATAR_IMAGE, AVATAR_IMAGE_SCALE, hasValidImage } from '../config/assetConfig';
import { SKIN_COLORS, HAIR_COLORS, DOT_PATTERNS } from '../config/avatarPixelConfig';
import PixelAvatar from './PixelAvatar';

interface UserAvatarProps {
    user: User;
    centerX: number;
    centerY: number;
    isSelf?: boolean;
}

/**
 * ユーザーID文字列から簡易ハッシュ値を生成
 */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

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
    // 優先度: user.avatarImageUrl > DEFAULT_AVATAR_IMAGE > ドット絵
    // ---------------------------------------------------
    const resolvedAvatarImage =
        hasValidImage(user.avatarImageUrl) ? user.avatarImageUrl
            : hasValidImage(DEFAULT_AVATAR_IMAGE) ? DEFAULT_AVATAR_IMAGE
                : null;

    const useImage = resolvedAvatarImage !== null;
    const imgSize = AVATAR_SIZE * AVATAR_IMAGE_SCALE;
    const clipId = `avatar-clip-${user.id}`;

    // ドット絵用カラー（サーバーから来なければIDからハッシュ決定）
    const hash = simpleHash(user.id);
    const skinColor = user.skinColor || SKIN_COLORS[hash % SKIN_COLORS.length];
    const hairColor = user.hairColor || HAIR_COLORS[(hash >> 4) % HAIR_COLORS.length];
    const clothesColor = user.avatarColor;
    const patternIndex = (hash >> 8) % DOT_PATTERNS.length;

    // ドット絵の表示サイズ
    const pixelAvatarSize = AVATAR_SIZE * 2;

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
                /* ===== ドット絵アバターモード ===== */
                <PixelAvatar
                    skinColor={skinColor}
                    hairColor={hairColor}
                    clothesColor={clothesColor}
                    size={pixelAvatarSize}
                    patternIndex={patternIndex}
                />
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
