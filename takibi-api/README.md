# Takibi API

リアルタイム焚き火アプリ [Takibi](../) のバックエンド API サーバー。

Rails 8 API mode + ActionCable で WebSocket リアルタイム通信を提供します。
DB なし・認証なし。全てインメモリで動作します。

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Ruby on Rails 8.1 (API mode) |
| リアルタイム通信 | ActionCable (WebSocket) |
| データ管理 | インメモリ (`Concurrent::Map`) |
| ActionCable アダプタ | Redis |
| テスト | RSpec |

---

## セットアップ

### 前提条件

- Ruby 3.4+
- Redis

### インストール・起動

```bash
# Redis を起動
brew install redis
brew services start redis

# 依存インストール
bundle install

# サーバー起動 (ポート 3000)
bin/rails server -p 3000
```

---

## API

### REST エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/v1/health` | ヘルスチェック |

```bash
curl http://localhost:3000/api/v1/health
# => {"status":"ok","timestamp":"2026-03-20T05:22:04Z"}
```

### WebSocket (ActionCable)

**接続先**: `ws://localhost:3000/cable`

接続ごとに UUID が自動発行され、匿名ユーザーとして識別されます。

#### チャネル: `BonfireChannel`

##### クライアント → サーバー

| アクション | ペイロード | 説明 |
|-----------|-----------|------|
| `join` | `{ name?: string }` | 焚き火に参加。name 省略時はランダムな匿名名が付与される |
| `leave` | なし | 焚き火から離脱 |

##### サーバー → クライアント

| イベント | ペイロード | 配信先 | 説明 |
|---------|-----------|--------|------|
| `welcome` | `{ userId, users[] }` | 本人のみ (transmit) | 参加時に自分の ID と全ユーザー一覧を返す |
| `user_joined` | `{ user }` | 全員 (broadcast) | 新しいユーザーが参加した |
| `user_left` | `{ userId }` | 全員 (broadcast) | ユーザーが離脱した |
| `count_update` | `{ count }` | 全員 (broadcast) | オンライン人数が更新された |

##### User オブジェクト

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ほたる",
  "avatarColor": "#FF6B6B",
  "avatarEmoji": "🧑",
  "avatarImageUrl": null,
  "joinedAt": 1710907200000,
  "angle": 120.0,
  "radius": 128
}
```

---

## アーキテクチャ

```
クライアント
    │
    │ WebSocket (ws://localhost:3000/cable)
    ▼
ApplicationCable::Connection
    │  UUID 発行 → anonymous_id
    ▼
BonfireChannel
    │  join / leave アクション
    ▼
BonfireSessionManager (Singleton)
    │  Concurrent::Map でスレッドセーフにユーザー管理
    │  円形配置の角度・半径を自動計算
    ▼
  broadcast → 全クライアントへ配信
```

### 主要ファイル

| ファイル | 役割 |
|---------|------|
| `app/channels/application_cable/connection.rb` | WebSocket 接続認証 (UUID 発行) |
| `app/channels/bonfire_channel.rb` | 焚き火チャネル (join/leave/broadcast) |
| `app/services/bonfire_session_manager.rb` | ユーザー管理・円形配置計算 |
| `app/controllers/api/v1/health_controller.rb` | ヘルスチェック |
| `config/cable.yml` | ActionCable 設定 (Redis) |
| `config/initializers/cors.rb` | CORS 設定 (localhost:5173 許可) |

---

## テスト

```bash
bundle exec rspec
```

### テスト構成

| ファイル | 内容 |
|---------|------|
| `spec/requests/api/v1/health_spec.rb` | ヘルスチェック API |
| `spec/channels/bonfire_channel_spec.rb` | チャネルの join/leave/broadcast |
| `spec/services/bonfire_session_manager_spec.rb` | ユーザー管理・位置計算 |

---

## 定数

フロントエンドと同じ値を使用しています。

**アバター絵文字**: 🧑 👩 👨 🧔 👧 🧒 🧕 🧑‍💻 👩‍💻 👨‍🍳

**アバター色**: `#FF6B6B` `#FFD93D` `#6BCB77` `#4D96FF` `#C77DFF` `#FF9A3C` `#00C9A7` `#F72585`

**匿名名**: たびびと, かくれんぼ, ほたる, かぜ, つき, ほし, もり, かわ, やま, そら, うみ, はな, ゆき, あめ, くも
