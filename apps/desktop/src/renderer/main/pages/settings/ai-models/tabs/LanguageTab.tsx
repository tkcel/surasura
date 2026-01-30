"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api as trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Check, Loader2, Eye, EyeOff, Info, AlertCircle } from "lucide-react";

export default function LanguageTab() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Formatter config
  const { data: formatterConfig, refetch: refetchFormatterConfig } =
    trpc.settings.getFormatterConfig.useQuery();

  // Get existing OpenAI config
  const { data: openaiConfig, isLoading: isLoadingConfig } =
    trpc.settings.getOpenAIConfig.useQuery();

  // Mutations
  const setOpenAIConfig = trpc.settings.setOpenAIConfig.useMutation();
  const validateConnection = trpc.models.validateOpenAIConnection.useMutation();
  const setFormatterConfig = trpc.settings.setFormatterConfig.useMutation();

  // Initialize from stored config
  useEffect(() => {
    if (openaiConfig?.apiKey) {
      setApiKey(openaiConfig.apiKey);
      setIsConnected(true);
    }
  }, [openaiConfig]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateConnection.mutateAsync({ apiKey });

      if (result.success) {
        await setOpenAIConfig.mutateAsync({ apiKey });
        setIsConnected(true);
        toast.success("OpenAI API key saved successfully");
      } else {
        setIsConnected(false);
        toast.error(result.error || "Invalid API key");
      }
    } catch (error) {
      setIsConnected(false);
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      await setOpenAIConfig.mutateAsync({ apiKey: "" });
      setApiKey("");
      setIsConnected(false);
      // Disable formatter if it was enabled
      if (formatterConfig?.enabled) {
        await setFormatterConfig.mutateAsync({
          enabled: false,
          modelId: undefined,
        });
        refetchFormatterConfig();
      }
      toast.success("OpenAI API key removed");
    } catch (error) {
      toast.error("Failed to remove API key");
    }
  };

  const handleFormatterToggle = async (enabled: boolean) => {
    if (enabled && !isConnected) {
      toast.error("Please configure OpenAI API key first");
      return;
    }

    try {
      await setFormatterConfig.mutateAsync({
        enabled,
        modelId: enabled ? "gpt-4o-mini" : undefined,
      });
      refetchFormatterConfig();
      toast.success(enabled ? "Text formatting enabled" : "Text formatting disabled");
    } catch (error) {
      toast.error("Failed to update formatter settings");
    }
  };

  if (isLoadingConfig) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* OpenAI API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            OpenAI API Configuration
            {isConnected && (
              <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              OpenAI API is used for text formatting and correction. Get your
              API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                platform.openai.com
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (isConnected) setIsConnected(false);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleValidateAndSave}
                disabled={isValidating || !apiKey.trim()}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConnected ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
              {isConnected && (
                <Button variant="outline" onClick={handleRemoveApiKey}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Formatting Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Text Formatting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Text Formatting</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to improve grammar, punctuation, and clarity of
                transcribed text
              </p>
            </div>
            <Switch
              checked={formatterConfig?.enabled ?? false}
              onCheckedChange={handleFormatterToggle}
            />
          </div>

          {formatterConfig?.enabled && !isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                OpenAI API key is required for text formatting. Please configure
                your API key above.
              </AlertDescription>
            </Alert>
          )}

          {formatterConfig?.enabled && isConnected && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                Using <span className="font-medium">gpt-4o-mini</span> for text
                formatting. This model provides a good balance of quality and
                cost.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
