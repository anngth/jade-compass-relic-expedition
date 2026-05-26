import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { IProviderConfig, ProviderType } from "@/types/llm";
import { useProviderData } from "@/hooks/use-provider-data";
import { useSettings } from "@/contexts/settings-context";

interface AIConfigurationCardProps {
  showApiKey: boolean;
  onToggleApiKeyVisibility: () => void;
}

export function AIConfigurationCard({
  showApiKey,
  onToggleApiKeyVisibility,
}: AIConfigurationCardProps) {
  const {
    apiKey,
    settings: { providerConfig },
    updateSettings,
    testConnection,
    isTestingConnection,
  } = useSettings();
  const providerData = useProviderData();
  const { provider } = providerConfig || {};
  const selectedProviderData = providerData?.[provider || "openai"];

  const updateProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProvider =
      (e.target.value as IProviderConfig["provider"]) || "openai";
    const defaults = providerData?.[nextProvider];
    if (!defaults) return;
    updateSettings({
      providerConfig: {
        ...(providerConfig || {}),
        provider: nextProvider,
        apiBase: defaults?.apiBase,
        model: defaults?.defaultModel,
        customModel: "",
      },
    });
  };

  const updateApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      providerConfig: {
        apiKeyManager: {
          ...(providerConfig?.apiKeyManager || {}),
          [providerConfig?.provider || "openai"]: e.target.value,
        },
      },
    });
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      return;
    }
    await testConnection();
  };

  return (
    <Card className="h-full p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">AI Configuration</CardTitle>
        <CardDescription className="text-sm">
          Configure your AI provider settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="font-pixel mb-1.5 block text-base text-[var(--primary)]">
            Provider
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <select
                className="w-full p-2 pr-8 appearance-none font-retro bg-[var(--background)] border-2 border-[var(--input)] pixel-shadow text-base"
                value={provider || "openai"}
                onChange={updateProvider}
              >
                {providerData
                  ? Object.keys(providerData).map((providerKey) => {
                      const data = providerData[providerKey as ProviderType];
                      return (
                        <option
                          key={providerKey}
                          value={providerKey}
                          className="font-retro text-xs text-[var(--primary)]"
                        >
                          {data.providerName}
                        </option>
                      );
                    })
                  : null}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-4 font-pixel text-sm"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !apiKey}
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </div>

        {/* API Key Hint */}
        <div className="rounded bg-[var(--accent)]/10 p-2">
          <p className="font-retro text-sm leading-5">
            {selectedProviderData ? (
              <>
                Get your API key at:{" "}
                <a
                  href={`https://${selectedProviderData.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] underline hover:text-[var(--accent)]"
                >
                  {selectedProviderData.link}
                </a>
              </>
            ) : null}
          </p>
        </div>

        {/* API Key Input */}
        <div>
          <label className="font-pixel mb-1.5 block text-base text-[var(--primary)]">
            API Key
          </label>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your API key here"
              value={apiKey || ""}
              onChange={updateApiKey}
              className="font-mono pr-8 text-sm"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
              onClick={onToggleApiKeyVisibility}
            >
              {showApiKey ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="font-retro mt-1.5 text-sm leading-5 text-[var(--muted-foreground)]">
            Session only — key syncs to a secure httpOnly cookie for LLM requests
          </p>
        </div>

        {/* Model Selection */}
        <ModelSelector />

        {/* Additional Info */}
        <div className="space-y-2.5 border-t border-[var(--border)] pt-3">
          <div className="flex items-start space-x-2">
            <span className="text-base text-[var(--accent)]">💾</span>
            <p className="font-retro text-sm leading-5 text-[var(--muted-foreground)]">
              <strong>Auto-save:</strong> Game settings are saved automatically
              (API keys are excluded)
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="text-base text-[var(--accent)]">🔒</span>
            <p className="font-retro text-sm leading-5 text-[var(--muted-foreground)]">
              <strong>Security:</strong> Keys are stored in session storage and
              encrypted in an httpOnly cookie — never sent in LLM request bodies
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
