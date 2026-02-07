// src/app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '默契盒子 - TacitBox',
  description: '通过问答游戏增进朋友间默契度的趣味小程序',
};

export default function HomePage() {
  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: '#61f7c0' }}
    >
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            TacitBox默契盒子 🧩✨
          </h1>
          <p className="text-white text-lg mt-4 drop-shadow">
            与朋友一起测试默契，增进了解
          </p>
        </div>
      </main>
    </div>
  );
}