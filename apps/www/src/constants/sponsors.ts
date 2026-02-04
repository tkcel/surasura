export type Sponsor = {
  name: string;
  logo?: string; // ロゴ画像のパス（例: "/sponsors/company.png"）
  url?: string; // 企業サイトへのリンク
};

// スポンサーが決まったらここに追加
//
// ロゴ画像の推奨サイズ:
//   - 高さ: 32px（表示時に h-8 = 32px に固定、幅は自動調整）
//   - 形式: PNG（透過）または SVG 推奨
//   - 配置場所: public/sponsors/
//
// 例:
// { name: "株式会社Example", logo: "/sponsors/example.png", url: "https://example.com" }
export const SPONSORS: Sponsor[] = [
  {
    name: "株式会社京徳",
    logo: "/sponsors/kyotoku.png",
    url: "https://kyo-toku.com",
  },
];

// スポンサーがいない場合のプレースホルダー
export const PLACEHOLDER_SPONSORS = [
  "スポンサー募集中",
  "あなたの企業ロゴ",
  "スポンサー募集中",
  "あなたの企業ロゴ",
  "スポンサー募集中",
  "あなたの企業ロゴ",
];
