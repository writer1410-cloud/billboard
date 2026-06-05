import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreeBill - 請求管理システム',
  description: 'フリーランス・制作会社向け 見積・請求・入金管理システム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
