import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDatabase, type TestDatabase } from "../../helpers/test-db";
import { seedDatabase } from "../../helpers/fixtures";
import { initializeTestServices } from "../../helpers/test-app";
import { setTestDatabase } from "../../setup";
import type { ServiceMap } from "@main/managers/service-manager";

type TestServices = Awaited<ReturnType<typeof initializeTestServices>>;

interface MockRecordingManager {
  signalStart: ReturnType<typeof vi.fn>;
  signalStop: ReturnType<typeof vi.fn>;
  signalCancel: ReturnType<typeof vi.fn>;
}

describe("Recording ルーター", () => {
  let testDb: TestDatabase;
  let serviceManager: TestServices["serviceManager"];
  let trpcCaller: TestServices["trpcCaller"];
  let cleanup: () => Promise<void>;
  let mockRecordingManager: MockRecordingManager;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
    if (testDb) {
      await testDb.close();
    }
  });

  describe("signalStart", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "recording-start-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;

      // Set up mock recording manager
      mockRecordingManager = {
        signalStart: vi.fn().mockResolvedValue(undefined),
        signalStop: vi.fn().mockResolvedValue(undefined),
        signalCancel: vi.fn().mockResolvedValue(undefined),
      };
    });

    it("recordingManager.signalStart()を呼び出す", async () => {
      // Override getService to return mock
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return mockRecordingManager as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await trpcCaller.recording.signalStart();

      expect(mockRecordingManager.signalStart).toHaveBeenCalledOnce();
    });

    it("recordingManagerが利用できない場合にエラーを投げる", async () => {
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return null as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await expect(trpcCaller.recording.signalStart()).rejects.toThrow(
        "Recording manager not available",
      );
    });
  });

  describe("signalStop", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "recording-stop-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;

      mockRecordingManager = {
        signalStart: vi.fn().mockResolvedValue(undefined),
        signalStop: vi.fn().mockResolvedValue(undefined),
        signalCancel: vi.fn().mockResolvedValue(undefined),
      };
    });

    it("recordingManager.signalStop()を呼び出す", async () => {
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return mockRecordingManager as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await trpcCaller.recording.signalStop();

      expect(mockRecordingManager.signalStop).toHaveBeenCalledOnce();
    });

    it("recordingManagerが利用できない場合にエラーを投げる", async () => {
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return null as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await expect(trpcCaller.recording.signalStop()).rejects.toThrow(
        "Recording manager not available",
      );
    });
  });

  describe("signalCancel", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "recording-cancel-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      trpcCaller = result.trpcCaller;
      cleanup = result.cleanup;

      mockRecordingManager = {
        signalStart: vi.fn().mockResolvedValue(undefined),
        signalStop: vi.fn().mockResolvedValue(undefined),
        signalCancel: vi.fn().mockResolvedValue(undefined),
      };
    });

    it("recordingManager.signalCancel()を呼び出す", async () => {
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return mockRecordingManager as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await trpcCaller.recording.signalCancel();

      expect(mockRecordingManager.signalCancel).toHaveBeenCalledOnce();
    });

    it("recordingManagerが利用できない場合にエラーを投げる", async () => {
      const originalGetService = serviceManager.getService.bind(serviceManager);
      vi.spyOn(serviceManager, "getService").mockImplementation(
        (<K extends keyof ServiceMap>(name: K) => {
          if (name === "recordingManager") return null as unknown as ServiceMap[K];
          return originalGetService(name);
        }) as typeof serviceManager.getService,
      );

      await expect(trpcCaller.recording.signalCancel()).rejects.toThrow(
        "Recording manager not available",
      );
    });
  });
});
