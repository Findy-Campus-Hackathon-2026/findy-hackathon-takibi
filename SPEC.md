# 🔥 Takibi（焚き火） アプリ 設計ドキュメント

> **バージョン**: v0.2.0
> **最終更新**: 2026-03-20
> **ステータス**: フロントエンド実装中 / バックエンド未実装
> このドキュメントはチーム共有・バイブコーディング継続のための基準仕様書です。

---

## 📌 コンセプト

ユーザーがアクセスするたびに、**夜の焚き火を囲む人々** が増えていくリアルタイム参加型2Dスマホアプリ。

- アクセスしたユーザーは焚き火の周りに円形配置で追加される
- 夜の雰囲気・暖かい炎・星空が没入感を演出する
- バックエンドと繋いで「誰が今ここにいるか」がリアルタイムに見える

---

## 🗂️ プロジェクト構成

```
findy-hackathon-takibi/
├── SPEC.md                         # ← このファイル（共通仕様書）
├── README.md                       # リポジトリ説明
└── takibi-app/                     # Reactフロントエンド
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    ├── public/
    │   └── images/
    │       ├── bonfire/            # 🔥 焚き火カスタム画像をここに配置
    │       │   └── README.md
    │       └── avatars/            # 👤 アバターカスタム画像をここに配置
    │           └── README.md
    └── src/
        ├── main.tsx                # エントリポイント
        ├── App.tsx                 # ルートコンポーネント
        ├── App.css                 # グローバルスタイル
        ├── index.css               # ベースリセット
        ├── config/
        │   └── assetConfig.ts      # 🎨 画像差し替えの一元設定（ここを変えるだけ）
        ├── types/
        │   └── index.ts            # 共通型定義
        ├── hooks/
        │   ├── useUsers.ts         # ユーザー管理フック（モック → WebSocket）
        │   └── useFlame.ts         # 炎パーティクルアニメーションフック
        └── components/
            ├── Bonfire.tsx         # 焚き火SVGコンポーネント（画像差し替え対応）
            ├── UserAvatar.tsx      # ユーザーアバターSVGコンポーネント（画像差し替え対応）
            ├── OnlineCounter.tsx   # 右上リアルタイムカウンター
            └── JoinButton.tsx      # 「焚き火を囲む」ボタン
```

---

## 🖥️ 画面仕様

### ビューポート
| 項目 | 値 |
|------|-----|
| 想定幅 | 390px（iPhone 14 基準） |
| 最大幅 | 430px |
| 高さ | 100dvh |
| 向き | ポートレート固定 |

### レイアウト構成（z-index順）

| レイヤー | 内容 | z-index |
|----------|------|---------|
| 背景 | 夜空グラデーション・星空CSS | 0 |
| SVGシーン | ユーザーアバター・焚き火 | 1 |
| UI（上部） | オンラインカウンター | 10 |
| UI（下部） | 参加ボタン | 10 |

### SVGキャンバス座標系
```
viewBox: "0 0 390 844"
CENTER_X: 195 (390 / 2)
CENTER_Y: 382 (844 / 2 - 40)  // 少し上寄り
```

---

## 🎨 デザインシステム

### カラーパレット

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--color-night-deepest` | `#060614` | 画面最背景 |
| `--color-night-deep` | `#0a0a1e` | 夜空上部 |
| `--color-night-mid` | `#0f0f2e` | 夜空中間 |
| `--color-fire-core` | `#fff9c4` | 炎コア（白黄） |
| `--color-fire-bright` | `#ffd54f` | 炎明（黄） |
| `--color-fire-mid` | `#ff8f00` | 炎中（オレンジ） |
| `--color-fire-warm` | `#e64a19` | 炎暖（赤オレンジ） |
| `--color-fire-deep` | `#bf360c` | 炎深（赤） |
| `--color-text-warm` | `rgba(255,220,170,0.9)` | メインテキスト |
| `--color-text-dim` | `rgba(255,200,140,0.55)` | サブテキスト |

### フォント
| 変数 | フォント | 用途 |
|------|---------|------|
| `--font-jp` | Noto Sans JP | 日本語テキスト全般 |
| `--font-en` | Outfit | 数字・英字（カウンター等） |

---

## 📐 主要コンポーネント仕様

### `<Bonfire>` (src/components/Bonfire.tsx)
焚き火本体SVGコンポーネント。SVG描画と画像表示を切り替え可能。

**Props:**
| Prop | 型 | デフォルト | 説明 |
|------|----|-----------|----- |
| `cx` | `number` | 必須 | キャンバス上の中心X座標 |
| `cy` | `number` | 必須 | キャンバス上の中心Y座標 |
| `imageSrc` | `string \| null` | `undefined` | カスタム焚き火画像URL（Prop経由の上書き用） |

**画像差し替え優先度:**
```
imageSrc prop > assetConfig.BONFIRE_IMAGE > SVGデフォルト描画
```

**SVGデフォルト描画の内部構成（描画順）:**
1. 地面グロー (`<ellipse>` + `radialGradient`)
2. 薪 × 3本 (`<rect>`)
3. 炭・熾火 (`<ellipse>`)
4. 炎パーティクル (`useFlame` フック → `<ellipse>` × 最大80個)
5. コア炎（静的・常に表示）

---

### `<UserAvatar>` (src/components/UserAvatar.tsx)
ユーザーアバターSVGコンポーネント。絵文字と画像の切り替え可能。

**Props:**
| Prop | 型 | 説明 |
|------|----|------|
| `user` | `User` | ユーザーデータ |
| `centerX` | `number` | 焚き火の中心X |
| `centerY` | `number` | 焚き火の中心Y |
| `isSelf` | `boolean` | 自分自身かどうか |

**アバター画像差し替え優先度:**
```
user.avatarImageUrl > assetConfig.DEFAULT_AVATAR_IMAGE > 絵文字+カラー円（デフォルト）
```

**配置計算:**
```ts
const rad = (user.angle * Math.PI) / 180;
const x = centerX + Math.cos(rad) * user.radius;
const y = centerY + Math.sin(rad) * user.radius;
```

---

### `<OnlineCounter>` (src/components/OnlineCounter.tsx)
右上のリアルタイムアクセス数UI。

**Props:**
| Prop | 型 | 説明 |
|------|----|------|
| `count` | `number` | 現在の接続人数 |
| `isConnected` | `boolean` | WebSocket接続状態 |

**挙動:**
- `count` が変わるたびにバウンスアニメーション
- 接続状態インジケーター（緑◉ = 接続中）
- 未接続時はグレー表示（TODO）

---

### `<JoinButton>` (src/components/JoinButton.tsx)
画面下部の参加ボタン。

**Props:**
| Prop | 型 | 説明 |
|------|----|------|
| `onClick` | `() => void` | 参加時コールバック |
| `hasJoined` | `boolean` | 参加済みかどうか |

**挙動:**
- 未参加: 「🔥 焚き火を囲む」ボタン表示
- 参加済み: 「🔥 焚き火を囲んでいます」テキスト表示（ボタン消去）

---

## 🧩 型定義 (src/types/index.ts)

### `User`
```ts
interface User {
  id: string;               // ユニークID
  joinedAt: number;         // 参加タイムスタンプ (ms)
  angle: number;            // 焚き火周りの配置角度 (0〜360°)
  radius: number;           // 中心からの距離 (px)
  avatarColor: string;      // アバター背景色（画像がない場合に使用）
  avatarEmoji: string;      // アバター絵文字（画像がない場合に使用）
  name: string;             // ユーザー名（匿名）
  avatarImageUrl?: string | null; // カスタムアバター画像URL（優先表示）
}
```

### `FlameParticle`
```ts
interface FlameParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  speedX: number;
  color: string;
  life: number;  // 0.0〜1.0
}
```

### `AppState`
```ts
interface AppState {
  users: User[];
  currentUserId: string | null;
  onlineCount: number;
  isConnected: boolean;
}
```

---

## 🔌 バックエンド連携仕様（未実装 / TODO）

> 現在はモックデータで動作。バックエンド実装時に以下に従って置き換える。

### 接続方式
- **プロトコル**: WebSocket (ws:// または wss://)
- **接続先**: `WS_ENDPOINT` 環境変数で管理 (`.env` に記載)

### イベント一覧

#### クライアント → サーバー
| イベント名 | ペイロード | 説明 |
|-----------|-----------|------|
| `join` | `{ name?: string }` | 焚き火に参加 |
| `leave` | なし | 離席・切断 |

#### サーバー → クライアント
| イベント名 | ペイロード | 説明 |
|-----------|-----------|------|
| `welcome` | `{ userId: string, users: User[] }` | 接続確立・初期状態 |
| `user_joined` | `User` | 新規ユーザー参加 |
| `user_left` | `{ userId: string }` | ユーザー離脱 |
| `count_update` | `{ count: number }` | 人数更新（集計のみ） |

### 実装時の変更箇所
1. `src/hooks/useUsers.ts` の `useEffect` 内モックを WebSocket 接続に置き換える
2. 環境変数 `VITE_WS_ENDPOINT` を追加する
3. 接続エラー時のリトライロジックを追加する

---

## ⚙️ 開発コマンド

```bash
# 依存インストール
cd takibi-app
npm install

# 開発サーバー起動 (http://localhost:5173)
npm run dev

# 型チェック
npx tsc --noEmit

# ビルド
npm run build
```

---

## 🚫 制約・注意事項

| 項目 | 内容 |
|------|------|
| スタイリング | Vanilla CSS のみ（Tailwind 不使用） |
| アニメーション | CSS アニメーション + requestAnimationFrame（Framer等不使用） |
| SVG描画 | React SVG（canvas 不使用） |
| 状態管理 | React useState/useReducer のみ（Redux等不使用） |
| バックエンド | 現時点で未実装。モック動作 |
| 画面向き | ポートレートのみ想定 |

---

## 🖼️ 画像差し替えガイド

### 焚き火画像を差し替える

1. 画像を `public/images/bonfire/` に配置 (例: `bonfire.png`)
2. `src/config/assetConfig.ts` を編集:

```ts
// 変更前（SVGデフォルト）
export const BONFIRE_IMAGE: string | null = null;

// 変更後（カスタム画像）
export const BONFIRE_IMAGE: string | null = '/images/bonfire/bonfire.png';
```

> 画像サイズは `BONFIRE_IMAGE_SIZE` で調整できます（デフォルト: 140×160px）

### ユーザーアバター画像を差し替える

#### 全ユーザー共通デフォルト画像
1. 画像を `public/images/avatars/` に配置 (例: `default.png`)
2. `src/config/assetConfig.ts` を編集:

```ts
export const DEFAULT_AVATAR_IMAGE: string | null = '/images/avatars/default.png';
```

#### 個別ユーザーの画像
バックエンドから受け取る `User` オブジェクトの `avatarImageUrl` に画像URLをセット:

```ts
const user: User = {
  id: 'user-001',
  avatarImageUrl: 'https://example.com/user-icon.png', // ← これがあれば優先表示
  // ... 他フィールド
};
```

### 推奨画像仕様
| 対象 | 形式 | 推奨サイズ | 背景 |
|------|------|-----------|------|
| 焚き火 | PNG / WebP / SVG | 280×320px以上 | 透過推奨 |
| アバター | PNG / WebP | 128×128px以上（正方形） | 透過推奨（円クリップされます） |

---

## 🗺️ ロードマップ

- [x] フロントエンド基本実装（焚き火・ユーザー・UIレイアウト）
- [x] 焚き火・アバターの画像差し替え対応（assetConfig）
- [ ] バックエンド実装（WebSocket サーバー）
- [ ] WebSocket 接続・リアルタイム同期
- [ ] ユーザー入室・退室アニメーション
- [ ] 炎の強さをユーザー数に応じて変化させる
- [ ] サウンドエフェクト（焚き火の音）
- [ ] OGP・シェア機能
- [ ] 本番デプロイ設定

---

*このドキュメントはバイブコーディングの共通基準として、すべてのAIエージェント・チームメンバーが参照してください。*
