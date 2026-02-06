import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StreamingWavWriter } from "@utils/streaming-wav-writer";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("StreamingWavWriter", () => {
  let scratchDir: string;
  let createdFiles: string[];

  beforeEach(() => {
    scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), "wav-writer-test-"));
    createdFiles = [];
  });

  afterEach(() => {
    // Clean up all created files and the scratch directory
    for (const filePath of createdFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    try {
      if (fs.existsSync(scratchDir)) {
        fs.rmSync(scratchDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  function createWriter(
    name = "test.wav",
    sampleRate = 16000,
    channels = 1,
    bitDepth = 16,
  ): StreamingWavWriter {
    const filePath = path.join(scratchDir, name);
    createdFiles.push(filePath);
    return new StreamingWavWriter(filePath, sampleRate, channels, bitDepth);
  }

  // ==================== Constructor ====================
  it("コンストラクタで44バイトのWAVヘッダーを持つファイルを作成する", async () => {
    const writer = createWriter("header-test.wav");
    // Allow write stream to flush
    await writer.finalize();

    const filePath = writer.getFilePath();
    const stats = fs.statSync(filePath);
    // File should be at least 44 bytes (header only, no data)
    expect(stats.size).toBe(44);

    // Verify RIFF header
    const buffer = fs.readFileSync(filePath);
    expect(buffer.toString("ascii", 0, 4)).toBe("RIFF");
    expect(buffer.toString("ascii", 8, 12)).toBe("WAVE");
    expect(buffer.toString("ascii", 12, 16)).toBe("fmt ");
    expect(buffer.toString("ascii", 36, 40)).toBe("data");
  });

  // ==================== appendAudio ====================
  it("Float32データをInt16に変換してファイルに追記する", async () => {
    const writer = createWriter("append-test.wav");
    const samples = new Float32Array([0.5, -0.5, 1.0, -1.0]);

    await writer.appendAudio(samples);
    await writer.finalize();

    const filePath = writer.getFilePath();
    const buffer = fs.readFileSync(filePath);

    // Header (44) + 4 samples * 2 bytes = 52
    expect(buffer.length).toBe(52);

    // Verify first sample: 0.5 * 32767 = 16383
    expect(buffer.readInt16LE(44)).toBe(Math.floor(0.5 * 32767));
    // Verify second sample: -0.5 * 32767 = -16383
    expect(buffer.readInt16LE(46)).toBe(Math.floor(-0.5 * 32767));
  });

  it("ファイナライズ済みのwriterへの追記時にエラーをスローする", async () => {
    const writer = createWriter("finalized-append-test.wav");
    await writer.finalize();

    await expect(
      writer.appendAudio(new Float32Array([0.5])),
    ).rejects.toThrow("Cannot append to finalized WAV file");
  });

  it("空配列の追記時は何も行わない", async () => {
    const writer = createWriter("empty-append-test.wav");
    await writer.appendAudio(new Float32Array([]));
    expect(writer.getDataSize()).toBe(0);
    await writer.finalize();
  });

  // ==================== finalize ====================
  it("ファイナライズ後にヘッダーを正しいサイズで更新する", async () => {
    const writer = createWriter("finalize-sizes-test.wav");
    const samples = new Float32Array([0.1, 0.2, 0.3]);

    await writer.appendAudio(samples);
    await writer.finalize();

    const filePath = writer.getFilePath();
    const buffer = fs.readFileSync(filePath);

    const dataSize = 3 * 2; // 3 samples * 2 bytes (Int16)

    // RIFF chunk size = dataSize + 36
    expect(buffer.readUInt32LE(4)).toBe(dataSize + 36);

    // data sub-chunk size
    expect(buffer.readUInt32LE(40)).toBe(dataSize);
  });

  it("finalizeを複数回呼び出しても冪等である", async () => {
    const writer = createWriter("idempotent-finalize-test.wav");
    const samples = new Float32Array([0.5]);

    await writer.appendAudio(samples);
    await writer.finalize();
    await writer.finalize(); // Second call should be a no-op

    const filePath = writer.getFilePath();
    const buffer = fs.readFileSync(filePath);

    // File should still be valid: 44 header + 2 bytes data
    expect(buffer.length).toBe(46);
  });

  // ==================== abort ====================
  it("abort後のさらなる書き込みを防止する", async () => {
    const writer = createWriter("abort-test.wav");
    await writer.appendAudio(new Float32Array([0.5]));
    await writer.abort();

    await expect(
      writer.appendAudio(new Float32Array([0.5])),
    ).rejects.toThrow("Cannot append to finalized WAV file");
  });

  // ==================== getDataSize ====================
  it("getDataSizeで書き込み済みバイト数を反映する", async () => {
    const writer = createWriter("data-size-test.wav");

    expect(writer.getDataSize()).toBe(0);

    await writer.appendAudio(new Float32Array([0.1, 0.2]));
    // 2 samples * 2 bytes = 4
    expect(writer.getDataSize()).toBe(4);

    await writer.appendAudio(new Float32Array([0.3]));
    // 4 + 1 sample * 2 bytes = 6
    expect(writer.getDataSize()).toBe(6);

    await writer.finalize();
  });

  // ==================== getFilePath ====================
  it("正しいファイルパスを返す", async () => {
    const writer = createWriter("path-test.wav");
    const filePath = writer.getFilePath();
    expect(filePath).toBe(path.join(scratchDir, "path-test.wav"));
    await writer.finalize();
  });

  // ==================== Multiple appends ====================
  it("複数回のappendAudio呼び出しでデータを蓄積する", async () => {
    const writer = createWriter("multi-append-test.wav");

    await writer.appendAudio(new Float32Array([0.1, 0.2]));
    await writer.appendAudio(new Float32Array([0.3, 0.4, 0.5]));

    expect(writer.getDataSize()).toBe(10); // 5 samples * 2 bytes

    await writer.finalize();

    const filePath = writer.getFilePath();
    const buffer = fs.readFileSync(filePath);

    // 44 header + 10 data bytes = 54
    expect(buffer.length).toBe(54);
  });

  // ==================== Full round-trip ====================
  it("書き込み・ファイナライズ・読み戻しの完全なラウンドトリップで有効なWAVファイルを生成する", async () => {
    const sampleRate = 16000;
    const channels = 1;
    const bitDepth = 16;
    const writer = createWriter("roundtrip-test.wav", sampleRate, channels, bitDepth);

    // Write some audio data
    const chunk1 = new Float32Array([0.0, 0.5, -0.5, 1.0, -1.0]);
    const chunk2 = new Float32Array([0.25, -0.25]);
    await writer.appendAudio(chunk1);
    await writer.appendAudio(chunk2);
    await writer.finalize();

    // Read back and verify
    const filePath = writer.getFilePath();
    const buffer = fs.readFileSync(filePath);

    const totalSamples = chunk1.length + chunk2.length;
    const dataSize = totalSamples * 2;

    // Verify RIFF header
    expect(buffer.toString("ascii", 0, 4)).toBe("RIFF");
    expect(buffer.readUInt32LE(4)).toBe(dataSize + 36);
    expect(buffer.toString("ascii", 8, 12)).toBe("WAVE");

    // Verify fmt sub-chunk
    expect(buffer.toString("ascii", 12, 16)).toBe("fmt ");
    expect(buffer.readUInt32LE(16)).toBe(16); // Sub-chunk size (PCM)
    expect(buffer.readUInt16LE(20)).toBe(1); // Audio format (PCM)
    expect(buffer.readUInt16LE(22)).toBe(channels);
    expect(buffer.readUInt32LE(24)).toBe(sampleRate);
    expect(buffer.readUInt32LE(28)).toBe((sampleRate * channels * bitDepth) / 8); // Byte rate
    expect(buffer.readUInt16LE(32)).toBe((channels * bitDepth) / 8); // Block align
    expect(buffer.readUInt16LE(34)).toBe(bitDepth);

    // Verify data sub-chunk
    expect(buffer.toString("ascii", 36, 40)).toBe("data");
    expect(buffer.readUInt32LE(40)).toBe(dataSize);

    // Verify total file size
    expect(buffer.length).toBe(44 + dataSize);

    // Verify sample values
    // First sample: 0.0 -> 0
    expect(buffer.readInt16LE(44)).toBe(0);
    // Second sample: 0.5 -> floor(0.5 * 32767) = 16383
    expect(buffer.readInt16LE(46)).toBe(Math.floor(0.5 * 32767));
    // Third sample: -0.5 -> floor(-0.5 * 32767) = -16383
    expect(buffer.readInt16LE(48)).toBe(Math.floor(-0.5 * 32767));
    // Fourth sample: 1.0 -> floor(1.0 * 32767) = 32767
    expect(buffer.readInt16LE(50)).toBe(Math.floor(1.0 * 32767));
    // Fifth sample: -1.0 -> clamped to -1.0, floor(-1.0 * 32767) = -32767
    expect(buffer.readInt16LE(52)).toBe(Math.floor(-1.0 * 32767));
  });
});
