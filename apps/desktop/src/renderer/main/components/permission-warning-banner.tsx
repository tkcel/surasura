import { AlertTriangle, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";

interface PermissionWarningBannerProps {
  onDismiss?: () => void;
}

export function PermissionWarningBanner({
  onDismiss,
}: PermissionWarningBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const isMac = window.electronAPI.platform === "darwin";

  // Check permissions on window focus (no polling to avoid OS freeze)
  const permissionsQuery = api.onboarding.checkAllRequirements.useQuery(
    undefined,
    { refetchOnWindowFocus: true },
  );

  // Determine which requirements are missing
  const microphoneMissing = !permissionsQuery.data?.microphone;
  const accessibilityMissing =
    isMac && !permissionsQuery.data?.accessibility;
  const apiKeyMissing = !permissionsQuery.data?.apiKey;

  // Show banner if any requirement is missing
  const hasMissingRequirements =
    microphoneMissing || accessibilityMissing || apiKeyMissing;
  const shouldShow =
    !dismissed && permissionsQuery.data && hasMissingRequirements;

  // Reset dismissed state when all requirements are met
  useEffect(() => {
    if (permissionsQuery.data && !hasMissingRequirements) {
      setDismissed(false);
    }
  }, [hasMissingRequirements, permissionsQuery.data]);

  if (!shouldShow) {
    return null;
  }

  const handleGoToSettings = () => {
    navigate({ to: "/settings/preferences" });
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  // Build message based on missing requirements
  const missingItems: string[] = [];
  if (microphoneMissing) missingItems.push("マイク権限");
  if (accessibilityMissing) missingItems.push("アクセシビリティ権限");
  if (apiKeyMissing) missingItems.push("APIキー");

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-4 shadow-lg border-b-2 border-amber-600">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-600/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-base">
              一部の機能が制限されています
            </p>
            <p className="text-sm opacity-90">
              {missingItems.join("、")}が設定されていません。設定画面から設定してください。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoToSettings}
            className="whitespace-nowrap bg-white text-amber-900 hover:bg-amber-100 font-medium"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            設定を開く
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-amber-900 hover:bg-amber-600/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
