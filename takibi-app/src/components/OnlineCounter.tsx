import React, { useEffect, useRef } from 'react';

interface OnlineCounterProps {
    count: number;
    isConnected: boolean;
}

const OnlineCounter: React.FC<OnlineCounterProps> = ({ count, isConnected }) => {
    const prevCountRef = useRef(count);
    const [bump, setBump] = React.useState(false);

    useEffect(() => {
        if (count !== prevCountRef.current) {
            setBump(true);
            const t = setTimeout(() => setBump(false), 450);
            prevCountRef.current = count;
            return () => clearTimeout(t);
        }
    }, [count]);

    return (
        <div
            id="online-counter"
            className={`online-counter${bump ? ' bump' : ''}`}
        >
            {isConnected && <span className="counter-dot" aria-label="接続中" />}
            <span className="counter-flame-icon">🔥</span>
            <span className="counter-number">{count.toLocaleString()}</span>
            <span className="counter-label">人が囲んでいる</span>
        </div>
    );
};

export default OnlineCounter;
