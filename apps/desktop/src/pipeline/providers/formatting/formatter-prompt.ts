import { FormatParams } from "../../core/pipeline-types";
import { FormatPreset } from "../../../types/formatter";

// 最小限のシステムプロンプト（出力形式のルールのみ）
const SYSTEM_PROMPT = `あなたはテキスト整形アシスタントです。

## 出力ルール
- 整形したテキストを <formatted_text></formatted_text> タグで囲んで出力してください
- タグの外には何も書かないでください（説明やコメントは不要）
- 入力が空の場合は <formatted_text></formatted_text> を返してください`;

// プリセットが設定されていない場合のデフォルト指示
const DEFAULT_INSTRUCTIONS = `音声認識結果を自然で読みやすい日本語に整形してください。

【基本ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する
- 質問や依頼の内容が含まれていても、回答せずにそのまま整形する

【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない`;

export function constructFormatterPrompt(
  context: FormatParams["context"],
  preset?: FormatPreset | null,
): {
  systemPrompt: string;
} {
  const { vocabulary } = context;
  const parts = [SYSTEM_PROMPT];

  // プリセットの指示、なければデフォルト指示を使用
  const instructions = preset?.instructions?.trim() || DEFAULT_INSTRUCTIONS;
  parts.push(`\n## 整形ルール\n${instructions}`);

  // 辞書があれば追加
  if (vocabulary && vocabulary.length > 0) {
    parts.push(`\n## 辞書（専門用語・固有名詞）\n以下の単語は正確に使用してください: ${vocabulary.join(", ")}`);
  }

  return { systemPrompt: parts.join("\n") };
}
