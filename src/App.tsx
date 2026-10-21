import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { Toaster } from '@project/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { listTabs } from 'zitejs/api';
import Layout from './components/Layout';
import TabPage from './components/TabPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { HIDDEN_TABS } from './lib/labels';
import { slug } from './lib/slug';
import { AppConfigProvider } from './lib/appConfig';

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();
  const [tabs, setTabs] = useState<string[] | null>(null);

  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect();
    if (user) listTabs({}).then((r) => setTabs(r.tabs.filter((t) => !HIDDEN_TABS.includes(t)).sort((a, b) => Number(b === 'Home') - Number(a === 'Home')))).catch(() => setTabs([]));
  }, [isLoading, user]);

  if (isLoading || !user || !tabs) return <Splash />;

  return (
    <BrowserRouter>
      <AppConfigProvider tabs={tabs}>
      <Toaster />
      <Routes>
        <Route element={<Layout tabs={tabs} />}>
          {tabs.map((t) => (
            <Route key={t} path={`/${slug(t)}`} element={<TabPage key={t} tab={t} readOnly={t === 'Home'} />} />
          ))}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to={`/${slug(tabs.includes('Home') ? 'Home' : tabs[0] ?? '')}`} replace />} />
        </Route>
      </Routes>
      </AppConfigProvider>
    </BrowserRouter>
  );
}