import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Gamepad2, LogOut, Settings, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@project/components/ui/sheet';
import { useAuth, logout } from 'zitejs/auth';
import { Button } from '@project/components/ui/button';
import { cn } from '@project/components/lib/utils';
import { slug } from '../lib/slug';
import { tabLabel, TabIcons } from '../lib/labels';
import { useAppConfig } from '../lib/appConfig';
function Logo() {
  const custom = useAppConfig().icons.logo;
  if (custom) return <img src={custom} alt="GWB Hub" className="h-8 w-8 rounded-lg object-contain" />;
  return <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
      <Gamepad2 className="h-4 w-4" />
    </span>;
}
export default function Layout({
  tabs
}: {
  tabs: string[];
}) {
  const {
    user
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button title="Menu" className="flex items-center gap-2 font-bold transition-opacity hover:opacity-80">
                <Logo />
                <span className='hidden sm:inline'>GWBHub</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Logo />
                  GWB Hub
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 grid gap-1">
                {[{
                to: '/settings',
                label: 'Settings',
                Icon: Settings
              }, {
                to: '/about',
                label: 'About',
                Icon: Info
              }].map(({
                to,
                label,
                Icon
              }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({
                isActive
              }) => cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <Icon className="h-4 w-4" />{label}
                  </NavLink>)}
              </nav>
            </SheetContent>
          </Sheet>
          <nav className="flex flex-1 flex-wrap gap-1 overflow-hidden sm:flex-nowrap sm:overflow-x-auto">
            {tabs.map(t => <NavLink key={t} to={`/${slug(t)}`} className={({
            isActive
          }) => cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors', isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground')}>
                  <TabIcons tab={t} className="h-4 w-4" />
                  {tabLabel(t)}
                </NavLink>)}
          </nav>
          <span className="hidden text-sm text-muted-foreground md:inline">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>;
}