import { describe, it, expect } from "vitest";
import { createDefaultContext } from "@/pipeline/core/context";

describe("createDefaultContext", () => {
  it("指定されたsessionIdを設定する", () => {
    const ctx = createDefaultContext("test-session-123");
    expect(ctx.sessionId).toBe("test-session-123");
  });

  it("vocabularyを空配列で初期化する", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.vocabulary).toEqual([]);
  });

  it("replacementsを空のMapで初期化する", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.replacements).toBeInstanceOf(Map);
    expect(ctx.sharedData.replacements.size).toBe(0);
  });

  it("dictionaryEntriesを空配列で初期化する", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.dictionaryEntries).toEqual([]);
  });

  it("languageのデフォルトが'ja'である", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.userPreferences.language).toBe("ja");
  });

  it("formattingStyleのデフォルトが'formal'である", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.userPreferences.formattingStyle).toBe("formal");
  });

  it("オーディオソースのデフォルトが'microphone'である", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.audioMetadata.source).toBe("microphone");
  });

  it("accessibilityContextのデフォルトがnullである", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.sharedData.accessibilityContext).toBeNull();
  });

  it("metadataを空のMapで初期化する", () => {
    const ctx = createDefaultContext("s1");
    expect(ctx.metadata).toBeInstanceOf(Map);
    expect(ctx.metadata.size).toBe(0);
  });
});
