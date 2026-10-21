import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAppConfig, GetAppConfigOutputType } from 'zitejs/api';

type Ctx = GetAppConfigOutputType & { tabs: string[]; refresh: () => Promise<void> };
const empty: Ctx = { images: {}, icons: {}, isAdmin: false, tabs: [], refresh: async () => {} };
const AppConfigContext = createContext<Ctx>(empty);

export function AppConfigProvider({ tabs, children }: { tabs: string[]; children: ReactNode }) {
  const [cfg, setCfg] = useState<GetAppConfigOutputType>({ images: {}, icons: {}, isAdmin: false });
  const refresh = () => getAppConfig({}).then(setCfg).catch(() => {});
  useEffect(() => { refresh(); }, []);
  return createElement(AppConfigContext.Provider, { value: { ...cfg, tabs, refresh } }, children);
}

export const useAppConfig = () => useContext(AppConfigContext);
export const gameKey = (name: string) => name.trim().toLowerCase();
