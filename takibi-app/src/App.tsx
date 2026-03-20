import { useMemo, useState } from 'react';
import Bonfire from './components/Bonfire';
import UserAvatar from './components/UserAvatar';
import OnlineCounter from './components/OnlineCounter';
import JoinButton from './components/JoinButton';
import ChatPanel from './components/ChatPanel';
import SettingsPanel from './components/SettingsPanel';
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
  const { users, currentUserId, onlineCount, isConnected, messages, addSelf, sendMessage, updateProfile } = useUsers();
  const [showSettings, setShowSettings] = useState(false);

  // ユーザーをきれいに円形配置するための角度再計算
  const positionedUsers: User[] = useMemo(() => {
    return users.map((u, i) => ({
      ...u,
      angle: calcUserAngle(i, users.length),
    }));
  }, [users]);

  const hasJoined = currentUserId !== null;
  const currentUser = useMemo(
    () => positionedUsers.find((u) => u.id === currentUserId),
    [positionedUsers, currentUserId],
  );

  return (
    <div id="app-root" className="app-root" aria-label="焚き火を囲もう">
      {/* ===== 右上カウンター ===== */}
      <OnlineCounter count={onlineCount} isConnected={isConnected} />

      {/* ===== 左上 設定ボタン ===== */}
      {hasJoined && (
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          aria-label="設定"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      )}

      {/* ===== 設定パネル ===== */}
      {showSettings && currentUser && (
        <SettingsPanel
          user={currentUser}
          onSave={updateProfile}
          onClose={() => setShowSettings(false)}
        />
      )}

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

      {/* ===== チャットパネル ===== */}
      <ChatPanel
        messages={messages}
        currentUserId={currentUserId}
        onSend={sendMessage}
        hasJoined={hasJoined}
      />

      {/* ===== 下部の参加UI ===== */}
      {!hasJoined && (
        <div id="bottom-ui" className="bottom-ui">
          <JoinButton onClick={addSelf} hasJoined={hasJoined} />
        </div>
      )}

      {/* ===== 星空エフェクト (背景にCSSアニメ) ===== */}
      <div className="stars" aria-hidden="true">
        {Array.from({ length: 120 }).map((_, i) => {
          const size = 0.8 + Math.random() * 1.4;
          // 30%の星を「bright（十字光条あり）」にする
          const isBright = Math.random() < 0.3;
          // 上部38%に集中（2乗で上ほど密集）
          const topRatio = Math.pow(Math.random(), 2.0) * 38;
          return (
            <span
              key={i}
              className={`star${isBright ? ' bright' : ''}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${topRatio}%`,
                animationDelay: `${Math.random() * 7}s`,
                animationDuration: `${1.5 + Math.random() * 4}s`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          );
        })}
      </div>

    </div>
  );
}

export default App;
