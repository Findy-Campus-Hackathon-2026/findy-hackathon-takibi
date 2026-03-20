import { useMemo } from 'react';
import Bonfire from './components/Bonfire';
import UserAvatar from './components/UserAvatar';
import OnlineCounter from './components/OnlineCounter';
import JoinButton from './components/JoinButton';
import { useUsers, calcUserAngle } from './hooks/useUsers';
import type { User } from './types';
import './App.css';

// スマホ画面の想定サイズ
const VIEWPORT_W = 390;
const VIEWPORT_H = 844;
const CENTER_X = VIEWPORT_W / 2;
const CENTER_Y = VIEWPORT_H / 2 - 40;

/**
 * メインアプリコンポーネント
 */
function App() {
  const { users, currentUserId, onlineCount, isConnected, addSelf } = useUsers();

  // ユーザーをきれいに円形配置するための角度再計算
  const positionedUsers: User[] = useMemo(() => {
    return users.map((u, i) => ({
      ...u,
      angle: calcUserAngle(i, users.length),
    }));
  }, [users]);

  const hasJoined = currentUserId !== null;

  return (
    <div id="app-root" className="app-root" aria-label="焚き火を囲もう">
      {/* ===== 右上カウンター ===== */}
      <OnlineCounter count={onlineCount} isConnected={isConnected} />

      {/* ===== メインSVGキャンバス ===== */}
      <svg
        id="scene-canvas"
        className="scene-canvas"
        viewBox={`0 0 ${VIEWPORT_W} ${VIEWPORT_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          {/* 地面のグロー */}
          <radialGradient id="groundGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8F00" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
          </radialGradient>

          {/* 夜空の背景グラデーション */}
          <radialGradient id="skyGlow" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#3D1A00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00000000" />
          </radialGradient>

          {/* 焚き火周囲の光輪 */}
          <radialGradient id="fireAura" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#FF6D00" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#FF8F00" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===== 夜の地面 ===== */}
        <rect x={0} y={0} width={VIEWPORT_W} height={VIEWPORT_H} fill="transparent" />

        {/* ===== 焚き火の暖かい光輪 ===== */}
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y + 10}
          rx={200}
          ry={170}
          fill="url(#fireAura)"
        />
        {/* より外側・淡いグロー */}
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y + 10}
          rx={280}
          ry={220}
          fill="url(#skyGlow)"
        />

        {/* ===== 地面 ===== */}
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y + 22}
          rx={120}
          ry={28}
          fill="#1A0800"
          opacity={0.7}
        />
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y + 22}
          rx={90}
          ry={20}
          fill="#2D0F00"
          opacity={0.8}
        />

        {/* ===== ユーザーアバター ===== */}
        {positionedUsers.map((user) => (
          <UserAvatar
            key={user.id}
            user={user}
            centerX={CENTER_X}
            centerY={CENTER_Y}
            isSelf={user.id === currentUserId}
          />
        ))}

        {/* ===== 焚き火 (ユーザーより手前) ===== */}
        <Bonfire cx={CENTER_X} cy={CENTER_Y} />
      </svg>

      {/* ===== 下部の参加UI ===== */}
      <div id="bottom-ui" className="bottom-ui">
        <JoinButton onClick={addSelf} hasJoined={hasJoined} />
      </div>

      {/* ===== 星空エフェクト (背景にCSSアニメ) ===== */}
      <div className="stars" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 65}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
