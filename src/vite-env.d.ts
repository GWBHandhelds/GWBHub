/// <reference types="vite/client" />

interface Window {
  isLocalDev?: boolean;
  isStaging?: boolean;
  isProduction?: boolean;
  _ziteUsageToken?: string;
  __ziteAllowAiFix?: boolean;
  _ziteOnFixError?: (error: Error) => void;
  _ziteOnReload?: () => void;
}