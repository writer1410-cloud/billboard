import Navigation from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Desktop top bar */}
      <header className="hidden md:flex bg-white border-b border-gray-200 h-12 items-center px-5 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-emerald-600 rounded-sm grid grid-cols-2 gap-px p-0.5 shrink-0">
            <div className="bg-white" />
            <div className="bg-white/50" />
            <div className="bg-white/50" />
            <div className="bg-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">FreeBill</span>
          <span className="text-xs text-gray-400 ml-1">請求管理システム</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-40 bg-white border-b-2 border-emerald-500">
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="w-6 h-6 bg-emerald-600 rounded-sm grid grid-cols-2 gap-px p-0.5 shrink-0">
                <div className="bg-white" />
                <div className="bg-white/50" />
                <div className="bg-white/50" />
                <div className="bg-white" />
              </div>
              <span className="font-bold text-gray-900">FreeBill</span>
            </div>
          </header>
          <div className="px-4 py-6 md:px-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
