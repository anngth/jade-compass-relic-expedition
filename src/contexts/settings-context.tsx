"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { logger } from "@/lib/logger";
import { ISettings, IProviderConfig } from "@/types/game";
import { StoredSettingsSchema } from "@/lib/schemas/settings";
import { syncApiSession, testProviderConnection } from "@/lib/api/llm-api";
import {
  clearLegacyApiKeysFromLocalStorage,
  loadApiKeys,
  saveApiKeys,
} from "@/lib/api-key-storage";
import { loadProviderData } from "@/hooks/use-provider-data";
import { debounce } from "@/utils/debounce";
import { toast } from "sonner";

interface SettingsContextType {
  apiKey?: string;
  settings: ISettings;
  isLoadingSettings: boolean;
  isTestingConnection: boolean;
  updateSettings: (settings: ISettings) => void;
  testConnection: () => Promise<void>;
}

const defaultSettings: ISettings = {
  gameConfig: {
    rounds: 2,
    choicesPerRound: 2,
    contentLanguage: "English",
  },
  providerConfig: {
    provider: "openai",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

function serializeSettingsForStorage(settings: ISettings): string {
  return JSON.stringify({
    ...settings,
    providerConfig: {
      ...settings.providerConfig,
      apiKeyManager: undefined,
    },
  });
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ISettings>(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const persistSettings = useMemo(
    () =>
      debounce((next: ISettings) => {
        localStorage.setItem(
          "jadeCompassSettings",
          serializeSettingsForStorage(next)
        );
      }, 300),
    []
  );

  const syncSession = useMemo(
    () =>
      debounce(async (providerConfig: IProviderConfig) => {
        try {
          await syncApiSession(providerConfig);
        } catch (error) {
          logger.error("Failed to sync API session:", error);
        }
      }, 400),
    []
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        clearLegacyApiKeysFromLocalStorage();

        const apiKeyManager = loadApiKeys();
        const providerData = await loadProviderData();
        const savedSettings = localStorage.getItem("jadeCompassSettings");
        if (savedSettings) {
          const parseResult = StoredSettingsSchema.safeParse(
            JSON.parse(savedSettings)
          );
          if (!parseResult.success) {
            logger.warn("Stored settings failed validation, using defaults", parseResult.error.issues);
            localStorage.removeItem("jadeCompassSettings");
            setSettings((prev) => ({
              ...prev,
              providerConfig: { ...prev.providerConfig, apiKeyManager },
            }));
            return;
          }
          const parsed = parseResult.data;
          const provider = parsed.providerConfig?.provider || "openai";
          const defaults =
            providerData?.[provider as keyof typeof providerData];

          const loadedSettings: ISettings = {
            gameConfig: {
              rounds: parsed.gameConfig?.rounds || 2,
              choicesPerRound: parsed.gameConfig?.choicesPerRound || 2,
              contentLanguage: parsed.gameConfig?.contentLanguage || "English",
            },
            providerConfig: {
              provider,
              apiBase: defaults?.apiBase,
              model: parsed.providerConfig?.model || defaults?.defaultModel,
              customModel: parsed.providerConfig?.customModel || "",
              apiKeyManager,
            },
          };

          setSettings(loadedSettings);

          const activeKey =
            apiKeyManager[provider as keyof typeof apiKeyManager];
          if (activeKey) {
            await syncApiSession(loadedSettings.providerConfig!);
          }
        } else {
          const initialSettings: ISettings = {
            gameConfig: {
              rounds: 2,
              choicesPerRound: 2,
              contentLanguage: "English",
            },
            providerConfig: {
              provider: "openai",
              model: providerData?.openai?.defaultModel,
              customModel: "",
              apiKeyManager,
            },
          };

          setSettings(initialSettings);
          localStorage.setItem(
            "jadeCompassSettings",
            serializeSettingsForStorage(initialSettings)
          );
        }
      } catch (e) {
        logger.error("Failed to load settings:", e);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(
    (newSettings: ISettings) => {
      if (newSettings.providerConfig?.apiKeyManager) {
        saveApiKeys(newSettings.providerConfig.apiKeyManager);
      }

      setSettings((prev) => {
        const updated: ISettings = {
          ...prev,
          gameConfig: {
            ...prev.gameConfig,
            ...newSettings.gameConfig,
          },
          providerConfig: {
            ...prev.providerConfig,
            ...newSettings.providerConfig,
          } as IProviderConfig,
        };

        persistSettings(updated);

        if (newSettings.providerConfig?.apiKeyManager) {
          syncSession(updated.providerConfig!);
        }

        return updated;
      });
    },
    [persistSettings, syncSession]
  );

  const testConnection = useCallback(async () => {
    try {
      setIsTestingConnection(true);
      const { providerConfig } = settingsRef.current;
      if (!providerConfig) {
        throw new Error("Provider configuration is required");
      }
      await testProviderConnection(providerConfig);
      toast.success("Connection test completed");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`${errorMessage}`);
      logger.error("Test connection error:", error);
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const apiKey = useMemo(
    () =>
      settings.providerConfig?.apiKeyManager?.[
        settings.providerConfig?.provider || "openai"
      ],
    [settings.providerConfig?.provider, settings.providerConfig?.apiKeyManager]
  );

  const contextValue = useMemo(
    () => ({
      apiKey,
      settings,
      isLoadingSettings,
      isTestingConnection,
      updateSettings,
      testConnection,
    }),
    [
      apiKey,
      settings,
      isLoadingSettings,
      isTestingConnection,
      updateSettings,
      testConnection,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
