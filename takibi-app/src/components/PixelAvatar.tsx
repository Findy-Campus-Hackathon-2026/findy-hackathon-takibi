import React from 'react';
import {
    DOT_PATTERNS,
    GRID_COLS,
    GRID_ROWS,
    EYE_COLOR,
    type DotPattern,
} from '../config/avatarPixelConfig';

interface PixelAvatarProps {
    skinColor: string;
    hairColor: string;
    clothesColor: string;
    size: number;
    patternIndex?: number;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({
    skinColor,
    hairColor,
    clothesColor,
    size,
    patternIndex = 0,
}) => {
    const pattern: DotPattern =
        DOT_PATTERNS[patternIndex % DOT_PATTERNS.length];
    const pixelW = size / GRID_COLS;
    const pixelH = size / GRID_ROWS;

    const colorMap: Record<number, string> = {
        1: skinColor,
        2: hairColor,
        3: clothesColor,
        4: EYE_COLOR,
    };

    const halfW = size / 2;
    const halfH = size / 2;

    return (
        <g transform={`translate(${-halfW}, ${-halfH})`}>
            {pattern.map((row, ry) =>
                row.map((cell, cx) => {
                    if (cell === 0) return null;
                    const fill = colorMap[cell];
                    if (!fill) return null;
                    return (
                        <rect
                            key={`${ry}-${cx}`}
                            x={cx * pixelW}
                            y={ry * pixelH}
                            width={pixelW + 0.5}
                            height={pixelH + 0.5}
                            fill={fill}
                        />
                    );
                }),
            )}
        </g>
    );
};

export default PixelAvatar;
