import { describe, it, expect, vi, afterEach } from "vitest";
import { cn, formatDate } from "@/lib/utils";

describe("cn (クラス名マージ)", () => {
  it("単純なクラス名をマージする", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("条件付きクラスを処理する", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("Tailwindの競合を解決する (後勝ち)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("undefinedとnullを処理する", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("空の引数を処理する", () => {
    expect(cn()).toBe("");
  });

  it("配列入力を処理する", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});

describe("formatDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("今日の日付で「Today」を返す", () => {
    const now = new Date();
    expect(formatDate(now)).toBe("Today");
  });

  it("昨日の日付で「Yesterday」を返す", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday)).toBe("Yesterday");
  });

  it("同じ年の過去の日付でフォーマット済み日付を返す", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
    const date = new Date(2025, 0, 10); // Jan 10, 2025
    const result = formatDate(date);
    expect(result).toContain("Jan");
    expect(result).toContain("10");
    // Should not contain year since it's the same year
    expect(result).not.toContain("2025");
  });

  it("異なる年の日付に年を含める", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
    const date = new Date(2024, 0, 10); // Jan 10, 2024
    const result = formatDate(date);
    expect(result).toContain("2024");
  });
});
