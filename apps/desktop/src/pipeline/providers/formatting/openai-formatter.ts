import { FormattingProvider, FormatParams } from "../../core/pipeline-types";
import { logger } from "../../../main/logger";
import { constructFormatterPrompt } from "./formatter-prompt";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export class OpenAIFormatter implements FormattingProvider {
  readonly name = "openai";

  private provider: ReturnType<typeof createOpenAI>;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.provider = createOpenAI({
      apiKey: apiKey,
    });
    this.model = model;
  }

  async format(params: FormatParams): Promise<string> {
    try {
      const { text, context } = params;

      // Construct the formatter prompt using the extracted function
      const { systemPrompt, allowsAnswer } = constructFormatterPrompt(
        context,
        context.preset,
        text,
      );

      logger.pipeline.info("Formatting request", {
        model: this.model,
        systemPrompt,
        userPrompt: text,
      });

      const { text: aiResponse } = await generateText({
        model: this.provider(this.model),
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1, // Low temperature for consistent formatting
        maxTokens: 2000,
      });

      logger.pipeline.info("Formatting raw response", {
        model: this.model,
        rawResponse: aiResponse,
      });

      // Extract formatted text from XML tags
      const match = aiResponse.match(
        /<formatted_text>([\s\S]*?)<\/formatted_text>/,
      );
      const formattedText = match ? match[1].trim() : aiResponse.trim();

      // 出力検証: 回答を許可しないプリセットで、出力が入力より大幅に長い場合は
      // 回答と判断して元のテキストを返す（整形では通常、テキスト長は大きく変わらない）
      if (!allowsAnswer) {
        const lengthRatio = formattedText.length / text.length;
        const isLikelyAnswer = lengthRatio > 1.5 && formattedText.length - text.length > 50;

        if (isLikelyAnswer) {
          logger.pipeline.warn("Formatting output appears to be an answer, using original text", {
            originalLength: text.length,
            formattedLength: formattedText.length,
            lengthRatio,
          });
          return text;
        }
      }

      logger.pipeline.debug("Formatting completed", {
        original: text,
        formatted: formattedText,
        hadXmlTags: !!match,
      });

      return formattedText;
    } catch (error) {
      logger.pipeline.error("Formatting failed:", error);
      // Return original text if formatting fails - simple fallback
      return params.text;
    }
  }
}
