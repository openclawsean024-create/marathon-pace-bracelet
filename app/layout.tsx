import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '馬拉松配速手環 | 賽道配速規劃工具',
  description: '選擇目標完賽時間，自動產出每公里配速表與可列印手環。支援台北、台中、宜蘭、澎湖、高雄、花蓮馬拉松。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
