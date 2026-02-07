import { describe, it, expect, vi, beforeEach } from "vitest";
import { TranscriptionService } from "@services/transcription-service";
import type { VADService } from "@services/vad-service";
import type { SettingsService } from "@services/settings-service";

// Create a minimal TranscriptionService instance to test private methods
function createMinimalService(): TranscriptionService {
  const mockVADService = { on: vi.fn(), emit: vi.fn() } as unknown as VADService;
  const mockSettingsService = {
    getFormatterConfig: vi.fn(),
    getPipelineSettings: vi.fn(),
    getDictationSettings: vi.fn(),
    getOpenAIConfig: vi.fn(),
    getActivePreset: vi.fn(),
    getDefaultLanguageModel: vi.fn(),
  } as unknown as SettingsService;
  return new TranscriptionService(mockVADService, mockSettingsService, null, null);
}

describe("TranscriptionServiceの純粋メソッド", () => {
  let service: TranscriptionService;

  beforeEach(() => {
    service = createMinimalService();
  });

  describe("preFormatLocalTranscription", () => {
    const preFormat = (transcription: string, preSelectionText: string | null | undefined) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).preFormatLocalTranscription(transcription, preSelectionText);

    it("スペースで始まらない場合、文字起こしをそのまま返す", () => {
      expect(preFormat("hello", "prev ")).toBe("hello");
    });

    it("preSelectionTextが空文字列の場合、先頭のスペースを除去する", () => {
      // Empty string means cursor at start of line - strip leading space
      expect(preFormat(" hello", "")).toBe("hello");
    });

    it("preSelectionTextが空白文字で終わる場合、先頭のスペースを除去する", () => {
      expect(preFormat(" hello", "previous ")).toBe("hello");
      expect(preFormat(" hello", "line\t")).toBe("hello");
      expect(preFormat(" hello", "line\n")).toBe("hello");
    });

    it("preSelectionTextがnullの場合、先頭のスペースを保持する", () => {
      // null means no accessibility context available - keep the space
      expect(preFormat(" hello", null)).toBe(" hello");
    });

    it("preSelectionTextがundefinedの場合、先頭のスペースを保持する", () => {
      expect(preFormat(" hello", undefined)).toBe(" hello");
    });

    it("preSelectionTextが非空白文字で終わる場合、先頭のスペースを保持する", () => {
      // Previous text ends with a word - Whisper's space is needed
      expect(preFormat(" hello", "previous")).toBe(" hello");
    });

    it("最初のスペース文字のみを除去する", () => {
      expect(preFormat("  hello", "")).toBe(" hello");
    });
  });

  describe("applyReplacements", () => {
    const applyReplacements = (text: string, replacements: Map<string, string>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any).applyReplacements(text, replacements);

    it("置換ルールがない場合、テキストをそのまま返す", () => {
      expect(applyReplacements("hello world", new Map())).toBe("hello world");
    });

    it("単語を置換後の文字列に置き換える", () => {
      const replacements = new Map([["hello", "hi"]]);
      expect(applyReplacements("hello world", replacements)).toBe("hi world");
    });

    it("大文字小文字を区別しない", () => {
      const replacements = new Map([["Hello", "Hi"]]);
      expect(applyReplacements("HELLO world", replacements)).toBe("Hi world");
    });

    it("単語境界を尊重する", () => {
      const replacements = new Map([["he", "she"]]);
      // "he" should not match inside "hello"
      expect(applyReplacements("hello he said", replacements)).toBe(
        "hello she said",
      );
    });

    it("複数の出現箇所を置換する", () => {
      const replacements = new Map([["foo", "bar"]]);
      expect(applyReplacements("foo and foo", replacements)).toBe(
        "bar and bar",
      );
    });

    it("単語内の正規表現特殊文字を処理する", () => {
      const replacements = new Map([["c++", "C Plus Plus"]]);
      expect(applyReplacements("I use c++", replacements)).toBe(
        "I use C Plus Plus",
      );
    });

    it("空文字列をそのまま返す", () => {
      const replacements = new Map([["a", "b"]]);
      expect(applyReplacements("", replacements)).toBe("");
    });

    it("複数の置換ルールを処理する", () => {
      const replacements = new Map([
        ["JS", "JavaScript"],
        ["TS", "TypeScript"],
      ]);
      expect(applyReplacements("I use JS and TS", replacements)).toBe(
        "I use JavaScript and TypeScript",
      );
    });

    it("日本語テキスト内のCJK読み方を置換する", () => {
      const replacements = new Map([["りんご", "アップル"]]);
      expect(applyReplacements("私はりんごが好き", replacements)).toBe(
        "私はアップルが好き",
      );
      expect(applyReplacements("りんご", replacements)).toBe("アップル");
    });

    it("日本語の読み方を英語の単語に置換する", () => {
      const replacements = new Map([
        ["スラスラ", "surasura"],
        ["すらすら", "surasura"],
      ]);
      expect(
        applyReplacements("すらすらというアプリケーションを作成しています", replacements),
      ).toBe("surasuraというアプリケーションを作成しています");
      expect(
        applyReplacements("スラスラを使っています", replacements),
      ).toBe("surasuraを使っています");
    });

    it("長い読み方を先に置換する（部分マッチ防止）", () => {
      const replacements = new Map([
        ["すら", "X"],
        ["すらすら", "surasura"],
      ]);
      expect(
        applyReplacements("すらすらというアプリ", replacements),
      ).toBe("surasuraというアプリ");
    });

    it("英語の単語境界は引き続き尊重する", () => {
      const replacements = new Map([["he", "she"]]);
      expect(applyReplacements("hello he said", replacements)).toBe(
        "hello she said",
      );
    });
  });
});
