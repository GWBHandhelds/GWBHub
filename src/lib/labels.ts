import { createElement } from 'react';
import { Monitor, PcCase, Smartphone, Home, type LucideIcon } from 'lucide-react';
import { useAppConfig } from './appConfig';

// Display the actual spreadsheet tab names.
export const tabLabel = (tab: string) => tab;

const ICONS: Record<string, LucideIcon[]> = {
  'PC Games On Android': [Monitor, PcCase],
  'Ports On Android': [Smartphone],
  Home: [Home],
};

export function TabIcons({ tab, className }: { tab: string; className?: string }) {
  const custom = useAppConfig().icons[tab];
  if (custom) return createElement('img', { src: custom, alt: '', className: `${className ?? ''} object-contain` });
  const icons = ICONS[tab];
  if (!icons) return null;
  return createElement('span', { className: 'inline-flex items-center gap-0.5' },
    ...icons.map((I, i) => createElement(I, { key: i, className })));
}

// Tabs hidden from the app entirely.
export const HIDDEN_TABS = ['Awesome Table Data'];

// When Emulator/App is DroidDeck, only these fields apply (Game Name is always kept).
const DROIDDECK_FIELDS = ['emulator/app', 'game name', 'status', 'app version', 'proton/wine version', 'device',
  'resolution', 'steam input', 'date added', 'uploaded by'];

export function isFieldVisible(header: string, get: (h: string) => string | undefined) {
  const app = (get('Emulator/App') ?? '').trim().toLowerCase();
  if (app !== 'droiddeck') return true;
  return DROIDDECK_FIELDS.includes(header.trim().toLowerCase());
}