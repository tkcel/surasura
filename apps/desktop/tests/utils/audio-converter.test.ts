import { describe, it, expect } from "vitest";
import { convertRawToWav } from "@utils/audio-converter";

describe("convertRawToWav", () => {
  function createFloat32Buffer(samples: number[]): Buffer {
    const float32 = new Float32Array(samples);
    return Buffer.from(float32.buffer);
  }

  describe("WAVヘッダー", () => {
    it("RIFFマーカーで始まる", () => {
      const raw = createFloat32Buffer([0, 0]);
      const wav = convertRawToWav(raw);
      expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    });

    it("WAVEフォーマット識別子を含む", () => {
      const raw = createFloat32Buffer([0, 0]);
      const wav = convertRawToWav(raw);
      expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    });

    it("fmtサブチャンクを含む", () => {
      const raw = createFloat32Buffer([0, 0]);
      const wav = convertRawToWav(raw);
      expect(wav.toString("ascii", 12, 16)).toBe("fmt ");
    });

    it("dataサブチャンクを含む", () => {
      const raw = createFloat32Buffer([0, 0]);
      const wav = convertRawToWav(raw);
      expect(wav.toString("ascii", 36, 40)).toBe("data");
    });

    it("RIFFヘッダーに正しいファイルサイズを設定する (fileSize = 36 + dataSize)", () => {
      const samples = [0.5, -0.5, 0.25];
      const raw = createFloat32Buffer(samples);
      const wav = convertRawToWav(raw);
      const dataSize = samples.length * 2; // Int16 = 2 bytes
      const expectedFileSize = 36 + dataSize;
      expect(wav.readUInt32LE(4)).toBe(expectedFileSize);
    });
  });

  describe("fmtサブチャンクのフィールド", () => {
    it("fmtサブチャンクサイズを16に設定する (PCM)", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt32LE(16)).toBe(16);
    });

    it("オーディオフォーマットを1に設定する (PCM)", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt16LE(20)).toBe(1);
    });

    it("チャンネル数を1に設定する (モノラル)", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt16LE(22)).toBe(1);
    });

    it("サンプルレートをデフォルトの16000に設定する", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt32LE(24)).toBe(16000);
    });

    it("指定されたカスタムサンプルレートを設定する", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]), 44100);
      expect(wav.readUInt32LE(24)).toBe(44100);
    });

    it("正しいバイトレートを設定する (sampleRate * channels * bitsPerSample / 8)", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]), 16000);
      // 16000 * 1 * 16 / 8 = 32000
      expect(wav.readUInt32LE(28)).toBe(32000);
    });

    it("ブロックアラインを2に設定する (モノラル16ビット)", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt16LE(32)).toBe(2);
    });

    it("ビット深度を16に設定する", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readUInt16LE(34)).toBe(16);
    });
  });

  describe("Float32からInt16への変換", () => {
    it("無音 (0.0) を0に変換する", () => {
      const wav = convertRawToWav(createFloat32Buffer([0]));
      expect(wav.readInt16LE(44)).toBe(0);
    });

    it("正の最大値 (1.0) を32767に変換する", () => {
      const wav = convertRawToWav(createFloat32Buffer([1.0]));
      expect(wav.readInt16LE(44)).toBe(32767);
    });

    it("負の最大値 (-1.0) を-32768に変換する", () => {
      const wav = convertRawToWav(createFloat32Buffer([-1.0]));
      expect(wav.readInt16LE(44)).toBe(-32768);
    });

    it("1.0を超える値をクランプする", () => {
      const wav = convertRawToWav(createFloat32Buffer([2.0]));
      expect(wav.readInt16LE(44)).toBe(32767);
    });

    it("-1.0未満の値をクランプする", () => {
      const wav = convertRawToWav(createFloat32Buffer([-2.0]));
      expect(wav.readInt16LE(44)).toBe(-32768);
    });
  });

  describe("空バッファと複数サンプルバッファ", () => {
    it("空バッファを処理できる", () => {
      const wav = convertRawToWav(createFloat32Buffer([]));
      // Header only: 44 bytes
      expect(wav.length).toBe(44);
      expect(wav.readUInt32LE(40)).toBe(0); // data size = 0
    });

    it("正しい合計バッファサイズを設定する", () => {
      const samples = [0.1, 0.2, 0.3, 0.4];
      const wav = convertRawToWav(createFloat32Buffer(samples));
      // 44 header + samples * 2 bytes
      expect(wav.length).toBe(44 + samples.length * 2);
    });
  });
});
