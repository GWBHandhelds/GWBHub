import { Gamepad2, Search, PlusCircle, UserCircle } from 'lucide-react';
const POINTS = [{
  Icon: Search,
  title: 'Browse reports',
  body: 'See how games and ports run on Android handhelds — filter by device, status and more.'
}, {
  Icon: PlusCircle,
  title: 'Share your results',
  body: 'Add your own compatibility reports. They go straight into the GWB Hub spreadsheet for everyone.'
}, {
  Icon: UserCircle,
  title: 'Your profile',
  body: 'Pick a username and picture in Settings, and manage the reports you’ve shared.'
}];
export default function AboutPage() {
  return <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground"><Gamepad2 className="h-7 w-7" /></span>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>About GWBHub</h1>
          <p className="text-sm text-muted-foreground">A community hub for Android gaming compatibility.</p>
        </div>
      </div>
      <p className='leading-relaxed text-muted-foreground'>GWBHub tracks how well games run on Android, including PC games played through emulators like GameNative and DroidDeck, and native ports of games to Android. Every report covers the device, the settings used and the result, so you can find what works on your handheld before you spend time setting it up.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {POINTS.map(({
        Icon,
        title,
        body
      }) => <div key={title} className="rounded-xl border bg-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>)}
      </div>
    </div>;
}