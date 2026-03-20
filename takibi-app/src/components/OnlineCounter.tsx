import React, { useEffect, useRef } from 'react';

interface OnlineCounterProps {
    count: number;
    isConnected: boolean;
}

/**
 * 右上のリアルタイムアクセス数表示
 */
const OnlineCounter: React.FC<OnlineCounterProps> = ({ count, isConnected }) => {
    const prevCountRef = useRef(count);
    const [bump, setBump] = React.useState(false);

    useEffect(() => {
        if (count !== prevCountRef.current) {
            setBump(true);
            const t = setTimeout(() => setBump(false), 400);
            prevCountRef.current = count;
            return () => clearTimeout(t);
        }
    }, [count]);

    return (
        <div id="online-counter" className={`online-counter${bump ? ' bump' : ''}`}>
            <span className="counter-dot" aria-label={isConnected ? '接続中' : '接続待ち'} />
            <span className="counter-flame-icon">🔥</span>
            <span className="counter-number">{count.toLocaleString()}</span>
            <span className="counter-label">人が囲んでいる</span>
        </div>
    );
};

export default OnlineCounter;
