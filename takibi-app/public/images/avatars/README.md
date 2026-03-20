# アバター画像の配置場所

このディレクトリにユーザーアバターのカスタム画像を配置してください。

## 対応形式
- PNG (推奨: 透過PNG)
- WebP
- SVG

## 推奨仕様
- 推奨サイズ: 128×128px 以上 (正方形)
- 背景: 透過推奨（円にクリッピングされます）

## ファイル構成例
```
avatars/
  default.png       ← 全ユーザー共通のデフォルト画像
  user_001.png      ← 個別ユーザー画像（将来対応）
```

## 差し替え手順

### 全ユーザー共通のデフォルト画像を設定する場合
`src/config/assetConfig.ts` の以下の行を変更:

```ts
// 変更前
export const DEFAULT_AVATAR_IMAGE: string | null = null;

// 変更後
export const DEFAULT_AVATAR_IMAGE: string | null = '/images/avatars/default.png';
```

### 個別ユーザーに画像を設定する場合
バックエンドから取得する `User` オブジェクトの `avatarImageUrl` フィールドに画像URLをセット。
個別URLが最優先で表示されます。
