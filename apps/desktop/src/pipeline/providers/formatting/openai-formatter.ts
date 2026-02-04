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
      const { systemPrompt } = constructFormatterPrompt(
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
      const formattedText = match ? match[1] : aiResponse;

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
