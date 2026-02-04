import { describe, it, expect } from "vitest";
import {
  replaceTemplateVariables,
  hasTranscriptionVariable,
  TEMPLATE_VARIABLES,
  type TemplateContext,
} from "../../src/pipeline/providers/formatting/template-variables";
import type { GetAccessibilityContextResult } from "@surasura/types";

// Helper to create a mock accessibility context
function createMockAccessibilityContext(
  overrides: Partial<{
    selectedText: string | null;
    appName: string | null;
  }> = {}
): GetAccessibilityContextResult {
  const selectedTextValue = "selectedText" in overrides ? overrides.selectedText : "selected text";
  const appNameValue = "appName" in overrides ? overrides.appName : "TestApp";

  return {
    context: {
      schemaVersion: "2.0",
      application: {
        name: appNameValue,
        bundleIdentifier: "com.test.app",
        version: "1.0.0",
        pid: 12345,
      },
      windowInfo: {
        title: "Test Window",
        url: null,
      },
      focusedElement: {
        role: "AXTextField",
        subrole: null,
        title: null,
        description: null,
        value: null,
        isEditable: true,
        isFocused: true,
        isSecure: false,
        isPlaceholder: false,
      },
      textSelection: {
        selectedText: selectedTextValue,
        fullContent: "full content here",
        preSelectionText: "text before",
        postSelectionText: "text after",
        selectionRange: { location: 0, length: 10 },
        isEditable: true,
        extractionMethod: "textMarkerRange",
        hasMultipleRanges: false,
        isPlaceholder: false,
        isSecure: false,
        fullContentTruncated: false,
      },
      timestamp: Date.now(),
      metrics: {
        totalTimeMs: 10,
        textMarkerAttempted: true,
        textMarkerSucceeded: true,
        fallbacksUsed: [],
        errors: [],
        timedOut: false,
        webAreaRetryAttempted: false,
        webAreaFound: false,
        webAreaRetrySucceeded: false,
      },
    },
  };
}

describe("Template Variables", () => {
  describe("TEMPLATE_VARIABLES", () => {
    it("should define transcription, selectedText and appName variables", () => {
      expect(TEMPLATE_VARIABLES).toHaveProperty("transcription");
      expect(TEMPLATE_VARIABLES).toHaveProperty("selectedText");
      expect(TEMPLATE_VARIABLES).toHaveProperty("appName");
      expect(Object.keys(TEMPLATE_VARIABLES)).toHaveLength(3);
    });

    it("should have name and description for each variable", () => {
      for (const [key, value] of Object.entries(TEMPLATE_VARIABLES)) {
        expect(value).toHaveProperty("name", key);
        expect(value).toHaveProperty("description");
        expect(typeof value.description).toBe("string");
        expect(value.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("replaceTemplateVariables", () => {
    it("should replace {{selectedText}} with actual selected text", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext({
          selectedText: "Hello World",
        }),
      };

      const result = replaceTemplateVariables(
        "Process this: {{selectedText}}",
        context
      );

      expect(result).toBe("Process this: Hello World");
    });

    it("should replace {{appName}} with application name", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext({
          appName: "Visual Studio Code",
        }),
      };

      const result = replaceTemplateVariables(
        "Running in: {{appName}}",
        context
      );

      expect(result).toBe("Running in: Visual Studio Code");
    });

    it("should replace multiple variables in one template", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext({
          selectedText: "selected",
          appName: "TestApp",
        }),
      };

      const result = replaceTemplateVariables(
        "Selected '{{selectedText}}' in {{appName}}",
        context
      );

      expect(result).toBe("Selected 'selected' in TestApp");
    });

    it("should replace empty string when context is null", () => {
      const context: TemplateContext = {
        accessibilityContext: null,
      };

      const result = replaceTemplateVariables(
        "Text: {{selectedText}}",
        context
      );

      expect(result).toBe("Text: ");
    });

    it("should replace empty string when context.context is null", () => {
      const context: TemplateContext = {
        accessibilityContext: { context: null },
      };

      const result = replaceTemplateVariables(
        "Text: {{selectedText}}",
        context
      );

      expect(result).toBe("Text: ");
    });

    it("should replace empty string when text selection values are null", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext({
          selectedText: null,
        }),
      };

      const result = replaceTemplateVariables(
        "Text: {{selectedText}}",
        context
      );

      expect(result).toBe("Text: ");
    });

    it("should leave unsupported variables unchanged", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext(),
      };

      const result = replaceTemplateVariables(
        "Unknown: {{unknownVariable}}",
        context
      );

      expect(result).toBe("Unknown: {{unknownVariable}}");
    });

    it("should handle template without variables", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext(),
      };

      const result = replaceTemplateVariables(
        "No variables here",
        context
      );

      expect(result).toBe("No variables here");
    });

    it("should handle empty template", () => {
      const context: TemplateContext = {
        accessibilityContext: createMockAccessibilityContext(),
      };

      const result = replaceTemplateVariables("", context);

      expect(result).toBe("");
    });

    it("should replace {{transcription}} with actual transcription", () => {
      const context: TemplateContext = {
        transcription: "こんにちは世界",
      };

      const result = replaceTemplateVariables(
        "以下を整形: {{transcription}}",
        context
      );

      expect(result).toBe("以下を整形: こんにちは世界");
    });

    it("should replace {{transcription}} with empty string when not provided", () => {
      const context: TemplateContext = {};

      const result = replaceTemplateVariables(
        "以下を整形: {{transcription}}",
        context
      );

      expect(result).toBe("以下を整形: ");
    });

    it("should replace all variables including transcription", () => {
      const context: TemplateContext = {
        transcription: "音声認識結果",
        accessibilityContext: createMockAccessibilityContext({
          selectedText: "選択テキスト",
          appName: "VSCode",
        }),
      };

      const result = replaceTemplateVariables(
        "アプリ: {{appName}}, 選択: {{selectedText}}, 音声: {{transcription}}",
        context
      );

      expect(result).toBe("アプリ: VSCode, 選択: 選択テキスト, 音声: 音声認識結果");
    });
  });

  describe("hasTranscriptionVariable", () => {
    it("should return true when template contains {{transcription}}", () => {
      expect(hasTranscriptionVariable("整形: {{transcription}}")).toBe(true);
    });

    it("should return false when template does not contain {{transcription}}", () => {
      expect(hasTranscriptionVariable("整形: {{selectedText}}")).toBe(false);
    });

    it("should return false for empty template", () => {
      expect(hasTranscriptionVariable("")).toBe(false);
    });

    it("should return false for partial match", () => {
      expect(hasTranscriptionVariable("transcription")).toBe(false);
      expect(hasTranscriptionVariable("{{transcription")).toBe(false);
    });
  });
});
