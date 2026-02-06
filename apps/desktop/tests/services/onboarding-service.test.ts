import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDatabase, type TestDatabase } from "../helpers/test-db";
import { seedDatabase } from "../helpers/fixtures";
import { initializeTestServices } from "../helpers/test-app";
import { setTestDatabase } from "../setup";
import type { OnboardingService } from "@services/onboarding-service";
import type { ServiceManager } from "@main/managers/service-manager";
import {
  OnboardingScreen,
  type OnboardingState,
} from "../../src/types/onboarding";

describe("OnboardingService", () => {
  let testDb: TestDatabase;
  let serviceManager: ServiceManager;
  let cleanup: () => Promise<void>;
  let onboardingService: OnboardingService;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
    if (testDb) {
      await testDb.close();
    }
  });

  // ==================== getOnboardingState ====================
  describe("getOnboardingState", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-get-state-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("オンボーディング状態が存在しない場合にnullを返す", async () => {
      const state = await onboardingService.getOnboardingState();
      expect(state).toBeNull();
    });
  });

  // ==================== saveOnboardingState ====================
  describe("saveOnboardingState", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-save-state-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("オンボーディング状態を保存して取得できる", async () => {
      const state: Partial<OnboardingState> = {
        completedVersion: 1,
        completedAt: new Date().toISOString(),
        lastVisitedScreen: OnboardingScreen.Permissions,
      };

      await onboardingService.saveOnboardingState(state);
      const retrieved = await onboardingService.getOnboardingState();

      expect(retrieved).toBeDefined();
      expect(retrieved!.completedVersion).toBe(1);
      expect(retrieved!.lastVisitedScreen).toBe(OnboardingScreen.Permissions);
    });
  });

  // ==================== checkNeedsOnboarding ====================
  describe("checkNeedsOnboarding", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-check-needs-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("オンボーディングが未完了の場合にneeded=trueを返す", async () => {
      const result = await onboardingService.checkNeedsOnboarding();
      expect(result.needed).toBe(true);
      expect(result.reason.notCompleted).toBe(true);
      expect(result).toHaveProperty("missingPermissions");
      expect(result).toHaveProperty("missingApiKey");
    });

    it("オンボーディングが完了済みの場合にneeded=falseを返す", async () => {
      await onboardingService.saveOnboardingState({
        completedVersion: 1,
        completedAt: new Date().toISOString(),
      });

      const result = await onboardingService.checkNeedsOnboarding();
      expect(result.needed).toBe(false);
      expect(result.reason.notCompleted).toBe(false);
    });
  });

  // ==================== completeOnboarding ====================
  describe("completeOnboarding", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-complete-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("completedAtタイムスタンプを設定する", async () => {
      const finalState: OnboardingState = {
        completedVersion: 1,
        completedAt: "",
      };

      await onboardingService.completeOnboarding(finalState);

      const state = await onboardingService.getOnboardingState();
      expect(state).toBeDefined();
      expect(state!.completedAt).toBeDefined();
      expect(state!.completedAt).not.toBe("");
    });
  });

  // ==================== savePreferences / savePartialProgress ====================
  describe("savePreferences / savePartialProgress", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-prefs-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("lastVisitedScreen付きで設定を保存する", async () => {
      await onboardingService.savePreferences({
        lastVisitedScreen: OnboardingScreen.APIKeySetup,
      });

      const state = await onboardingService.getOnboardingState();
      expect(state).toBeDefined();
      expect(state!.lastVisitedScreen).toBe(OnboardingScreen.APIKeySetup);
    });

    it("部分的な進捗を保存して既存の状態とマージする", async () => {
      await onboardingService.savePartialProgress({
        completedVersion: 1,
      });

      await onboardingService.savePartialProgress({
        lastVisitedScreen: OnboardingScreen.Completion,
      });

      const state = await onboardingService.getOnboardingState();
      expect(state).toBeDefined();
      expect(state!.completedVersion).toBe(1);
      expect(state!.lastVisitedScreen).toBe(OnboardingScreen.Completion);
    });
  });

  // ==================== getFeatureFlags ====================
  describe("getFeatureFlags", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-flags-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("環境変数からフィーチャーフラグを確認する", () => {
      const flags = onboardingService.getFeatureFlags();
      expect(flags).toBeDefined();
      expect(flags).toHaveProperty("skipWelcome");
      expect(flags).toHaveProperty("skipFeatures");
      expect(flags).toHaveProperty("skipDiscovery");
      expect(flags).toHaveProperty("skipModels");
      // skipDiscovery is always true
      expect(flags.skipDiscovery).toBe(true);
    });
  });

  // ==================== getSkippedScreens ====================
  describe("getSkippedScreens", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-skipped-screens-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("フィーチャーフラグに基づいてスキップ画面を返す", () => {
      const skipped = onboardingService.getSkippedScreens();
      expect(Array.isArray(skipped)).toBe(true);
      // Discovery screen is always skipped
      expect(skipped).toContain("discovery");
    });
  });

  // ==================== isInProgress ====================
  describe("isInProgress", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-in-progress-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("初期状態でfalseを返す", () => {
      expect(onboardingService.isInProgress()).toBe(false);
    });
  });

  // ==================== startOnboardingFlow / completeOnboardingFlow ====================
  describe("startOnboardingFlow / completeOnboardingFlow", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-flow-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("開始後にisInProgressがtrueになる", async () => {
      await onboardingService.startOnboardingFlow();
      expect(onboardingService.isInProgress()).toBe(true);
    });

    it("completeOnboardingFlow実行時にcompletedイベントを発火する", async () => {
      const listener = vi.fn();
      onboardingService.on("completed", listener);

      await onboardingService.startOnboardingFlow();

      const finalState: OnboardingState = {
        completedVersion: 1,
        completedAt: new Date().toISOString(),
      };

      await onboardingService.completeOnboardingFlow(finalState);

      expect(listener).toHaveBeenCalled();
      expect(onboardingService.isInProgress()).toBe(false);

      onboardingService.removeListener("completed", listener);
    });
  });

  // ==================== cancelOnboardingFlow ====================
  describe("cancelOnboardingFlow", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({ name: "onboarding-cancel-test" });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("cancelledイベントを発火してisInProgressをfalseにする", async () => {
      const listener = vi.fn();
      onboardingService.on("cancelled", listener);

      await onboardingService.startOnboardingFlow();
      expect(onboardingService.isInProgress()).toBe(true);

      await onboardingService.cancelOnboardingFlow();

      expect(listener).toHaveBeenCalled();
      expect(onboardingService.isInProgress()).toBe(false);

      onboardingService.removeListener("cancelled", listener);
    });
  });

  // ==================== checkAccessibilityPermission ====================
  describe("checkAccessibilityPermission", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-accessibility-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("キャッシュされたgetAccessibilityStatusからbooleanを返す", () => {
      const result = onboardingService.checkAccessibilityPermission();
      expect(typeof result).toBe("boolean");
    });
  });

  // ==================== getAccessibilityStatus caching ====================
  describe("getAccessibilityStatusのキャッシュ", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-accessibility-cache-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("TTL内の連続呼び出しで一貫した結果を返す", () => {
      const first = onboardingService.checkAccessibilityPermission();
      const second = onboardingService.checkAccessibilityPermission();
      expect(first).toBe(second);
    });
  });

  // ==================== invalidateAccessibilityCache ====================
  describe("invalidateAccessibilityCache", () => {
    beforeEach(async () => {
      testDb = await createTestDatabase({
        name: "onboarding-invalidate-cache-test",
      });
      setTestDatabase(testDb.db);
      await seedDatabase(testDb, "empty");
      const result = await initializeTestServices(testDb);
      serviceManager = result.serviceManager;
      cleanup = result.cleanup;
      onboardingService = serviceManager.getOnboardingService();
    });

    it("キャッシュの無効化と再チェックがエラーなく行える", async () => {
      const { invalidateAccessibilityCache } = await import(
        "@services/onboarding-service"
      );

      // Should not throw
      invalidateAccessibilityCache();

      // Next call should refresh
      const result = onboardingService.checkAccessibilityPermission();
      expect(typeof result).toBe("boolean");
    });
  });
});
