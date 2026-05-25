"use client";

import { useEffect, useState } from "react";
import { ProviderDataType } from "@/types/game";

let cachedProviderData: ProviderDataType | null = null;

export function useProviderData(): ProviderDataType | null {
  const [data, setData] = useState<ProviderDataType | null>(cachedProviderData);

  useEffect(() => {
    if (cachedProviderData) return;

    import("@/lib/providers/provider-data").then((mod) => {
      cachedProviderData = mod.providerData;
      setData(mod.providerData);
    });
  }, []);

  return data;
}

export async function loadProviderData(): Promise<ProviderDataType> {
  if (cachedProviderData) return cachedProviderData;
  const mod = await import("@/lib/providers/provider-data");
  cachedProviderData = mod.providerData;
  return mod.providerData;
}
