import React from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { useProviderData } from "@/hooks/use-provider-data";
import { useSettings } from "@/contexts/settings-context";

export function ModelSelector() {
  const { settings, updateSettings } = useSettings();
  const providerData = useProviderData();
  const { providerConfig } = settings;
  const provider = providerConfig?.provider || "openai";
  const providerInfo = providerData?.[provider];
  const models = providerInfo?.models || [];
  const model = providerConfig?.model ?? providerInfo?.defaultModel ?? "";
  const customModel = providerConfig?.customModel;

  const updateModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    updateSettings({
      providerConfig: {
        ...providerConfig,
        model: next,
        ...(next !== "__custom__" ? { customModel: undefined } : {}),
      },
    });
  };

  const updateCustomModel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (model === "__custom__") {
      updateSettings({
        providerConfig: {
          ...providerConfig,
          customModel: e.target.value,
        },
      });
    }
  };

  return (
    <div>
      <label className="font-pixel text-sm mb-2 block text-[var(--primary)]">
        Model
      </label>
      <div className="relative">
        <select
          id="model"
          className="w-full p-2 pr-8 appearance-none font-retro bg-[var(--background)] border-2 border-[var(--input)] pixel-shadow mb-2 text-xs focus:border-[var(--primary)] focus:outline-none"
          value={model}
          onChange={updateModel}
        >
          {models.map((modelOption) => (
            <option key={modelOption.value} value={modelOption.value}>
              {modelOption.label || modelOption.value}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
      </div>
      <Input
        type="text"
        placeholder={
          model === "__custom__"
            ? "Enter custom model name"
            : "Select 'Custom Model' option above to enter custom model"
        }
        value={model === "__custom__" ? customModel || "" : ""}
        onChange={updateCustomModel}
        disabled={model !== "__custom__"}
        className={`font-mono text-xs mt-2 ${
          model !== "__custom__" ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
