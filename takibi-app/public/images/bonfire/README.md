# 焚き火画像の配置場所

このディレクトリに焚き火のカスタム画像を配置してください。

## 対応形式
- PNG (推奨: 透過PNG)
- WebP
- SVG

## 推奨仕様
- ファイル名: `bonfire.png` (または `bonfire.webp` / `bonfire.svg`)
- 推奨サイズ: 280×320px 以上 (2倍解像度対応)
- 背景: 透過推奨

## 差し替え手順
`src/config/assetConfig.ts` の以下の行を変更するだけです:

```ts
// 変更前
export const BONFIRE_IMAGE: string | null = null;

// 変更後
export const BONFIRE_IMAGE: string | null = '/images/bonfire/bonfire.png';
```

画像を設定すると、SVGアニメーション炎の代わりにこの画像が表示されます。
