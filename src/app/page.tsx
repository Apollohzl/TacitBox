// src/app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '默契盒子 - TacitBox',
  description: '通过问答游戏增进朋友间默契度的趣味小程序',
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">欢迎来到默契盒子 (TacitBox)</h1>
        <p className="mt-4">通过问答游戏增进朋友间默契度的趣味小程序</p>
      </div>
    </main>
  );
}