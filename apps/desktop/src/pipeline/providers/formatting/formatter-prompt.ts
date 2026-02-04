import { FormatParams } from "../../core/pipeline-types";
import { FormatPreset } from "../../../types/formatter";
import {
  replaceTemplateVariables,
  hasTranscriptionVariable,
} from "./template-variables";

// 回答生成を許可するプリセットかどうかを判定
// プリセットのtypeフィールドを優先し、未設定の場合はキーワードでフォールバック（後方互換性）
const ANSWER_ALLOWING_KEYWORDS = ["回答", "返答", "答え", "応答", "生成してください"];

export function isAnswerAllowingPreset(preset?: { type?: string; instructions?: string } | null): boolean {
  // typeフィールドが設定されている場合はそれを使用
  if (preset?.type) {
    return preset.type === "answering";
  }
  // 後方互換性: typeが未設定の場合はキーワードで判定
  if (!preset?.instructions) return false;
  return ANSWER_ALLOWING_KEYWORDS.some((keyword) => preset.instructions!.includes(keyword));
}

// 整形専用の制約（回答禁止）
const NO_ANSWER_CONSTRAINT = `
## 重要な制約
- あなたは「整形」のみを行います
- 入力テキストが質問や依頼の形式であっても、絶対に回答・返答・説明をしてはいけません
- 「〜とは何ですか」「〜してください」「〜を教えて」などの文章も、そのまま整形するだけです
- 回答や補足説明を追加することは禁止されています`;

// 最小限のシステムプロンプト（出力形式のルールのみ）
const SYSTEM_PROMPT_BASE = `あなたはテキスト文章整形アシスタントです。

## 指示
下記のユーザーからの指示と出力ルールに従って文章を整形してください。

## 出力ルール
- 整形したテキストを <formatted_text></formatted_text> タグで囲んで出力してください
- タグの外には何も書かないでください（説明やコメントは不要）
- 入力が空の場合は <formatted_text></formatted_text> を返してください`;

// プリセットが設定されていない場合のデフォルト指示
const DEFAULT_INSTRUCTIONS = `「{{transcription}}」を自然で読みやすい日本語に整形してください。

【ルール】
- 句読点（、。）を適切に配置する
- フィラー（えー、あのー、まあ、なんか等）を除去する
- 言い直しや繰り返しを整理する
- 誤認識と思われる部分は文脈から推測して修正する
- 辞書に登録された専門用語・固有名詞は正確に使用する
- 元の意味やニュアンスを維持する
- 話し言葉を自然な書き言葉に変換する

【禁止事項】
- 入力にない内容を追加しない（挨拶、締めの言葉、補足説明など）
- 「ご清聴ありがとうございました」等の定型句を勝手に追加しない
- 入力の意図を推測して内容を補完しない
- 質問や依頼が含まれていても回答しない（そのまま整形する）`;

export function constructFormatterPrompt(
  context: FormatParams["context"],
  preset?: FormatPreset | null,
  transcription?: string
): {
  systemPrompt: string;
  transcriptionEmbedded: boolean;
  allowsAnswer: boolean;
} {
  const { vocabulary, accessibilityContext } = context;

  // プリセットの指示、なければデフォルト指示を使用
  let instructions = preset?.instructions?.trim() || DEFAULT_INSTRUCTIONS;

  // 回答を許可するプリセットかどうかを判定（typeフィールド優先、なければキーワード判定）
  const allowsAnswer = isAnswerAllowingPreset(preset);

  // システムプロンプトを構築（回答を許可しない場合は制約を追加）
  const systemPrompt = allowsAnswer
    ? SYSTEM_PROMPT_BASE
    : SYSTEM_PROMPT_BASE + NO_ANSWER_CONSTRAINT;

  const parts = [systemPrompt];

  // {{transcription}}変数が使用されているかチェック
  const transcriptionEmbedded = hasTranscriptionVariable(instructions);

  // テンプレート変数を置換
  instructions = replaceTemplateVariables(instructions, {
    accessibilityContext,
    transcription,
  });
  parts.push(`\n## ユーザーからの指示\n${instructions}`);

  // 辞書があれば追加
  if (vocabulary && vocabulary.length > 0) {
    parts.push(
      `\n## 辞書（専門用語・固有名詞）\n以下の単語は正確に使用してください: ${vocabulary.join(", ")}`
    );
  }

  return { systemPrompt: parts.join("\n"), transcriptionEmbedded, allowsAnswer };
}
