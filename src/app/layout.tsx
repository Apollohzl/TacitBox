import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '默契盒子 (TacitBox)',
  description: '通过出题和答题来测试朋友间的默契度',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}