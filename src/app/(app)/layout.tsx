import Navigation from '@/components/Navigation';

function MobileHeaderWave() {
  return (
    <svg
      viewBox="0 0 375 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 12, display: 'block' }}
      preserveAspectRatio="none"
    >
      <path
        d="M0 6 C47 0 94 12 141 6 C188 0 235 12 282 6 C329 0 352 9 375 6 V12 H0 Z"
        fill="#059669"
        fillOpacity="0.07"
      />
      <path
        d="M0 6 C47 0 94 12 141 6 C188 0 235 12 282 6 C329 0 352 9 375 6"
        stroke="#059669"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        <header className="md:hidden sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="w-6 h-6 bg-emerald-600 rounded-sm grid grid-cols-2 gap-px p-0.5 shrink-0">
              <div className="bg-white" />
              <div className="bg-white/50" />
              <div className="bg-white/50" />
              <div className="bg-white" />
            </div>
            <span className="font-bold text-gray-900">FreeBill</span>
          </div>
          <MobileHeaderWave />
        </header>
        <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
