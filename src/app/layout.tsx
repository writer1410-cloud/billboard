import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'FreeBill - 請求管理システム',
  description: 'フリーランス・制作会社向け 見積・請求・入金管理システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-y-auto">
            <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
              <span className="font-bold text-gray-900">FreeBill</span>
            </header>
            <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
