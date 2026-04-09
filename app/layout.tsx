import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '馬拉松配速手環產生器',
  description: '輸入目標時間與賽道，產生可列印配速手環',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
