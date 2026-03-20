// ===========================
// 共通型定義
// ===========================

/**
 * アプリに接続しているユーザーを表す型
 */
export interface User {
    id: string;               // ユニークID (将来的にはサーバーから付与)
    joinedAt: number;         // 参加タイムスタンプ (ms)
    angle: number;            // 焚き火の周りの配置角度 (0〜360°)
    radius: number;           // 中心からの距離 (px)
    avatarColor: string;      // アバターの背景色 (画像がない場合に使用)
    avatarEmoji: string;      // アバターの絵文字  (画像がない場合に使用)
    name: string;             // ユーザー名 (匿名)
    /**
     * カスタムアバター画像URL（オプション）
     * - 指定あり → 画像を優先表示
     * - 未指定 / null → 絵文字+カラー円にフォールバック
     * - バックエンドから個別ユーザー画像を受け取る際にセットする
     */
    avatarImageUrl?: string | null;
    /** ドット絵アバターの肌色（バックエンドから割り当て） */
    skinColor?: string;
    /** ドット絵アバターの髪色（バックエンドから割り当て） */
    hairColor?: string;
}

/**
 * 炎のパーティクル一粒
 */
export interface FlameParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speedY: number;
    speedX: number;
    color: string;
    life: number;       // 0.0〜1.0 (1.0が生まれたて)
}

/**
 * チャットメッセージ
 */
export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    avatarColor: string;
    body: string;
    timestamp: number;
}

/**
 * アプリ全体の状態
 */
export interface AppState {
    users: User[];
    currentUserId: string | null;
    onlineCount: number;
    isConnected: boolean;
    messages: ChatMessage[];
}
