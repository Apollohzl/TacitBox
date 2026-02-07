// src/app/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '默契盒子 - TacitBox',
  description: '通过问答游戏增进朋友间默契度的趣味小程序',
};

export default function HomePage() {
  return (
    <main className="min-h-screen w-full p-8 home-page">
      {/* 顶部标题 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          TacitBox默契盒子 🧩✨
        </h1>
        <p className="text-white text-lg mt-2 drop-shadow">
          与朋友一起测试默契，增进了解
        </p>
      </div>

      {/* 主要内容区域 - 双列布局 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左列 */}
        <div className="space-y-6">
          {/* 去出题卡片 - 最大卡片 */}
          <Link href="/create-quiz" className="block">
            <div className="bg-[#4A90E2] rounded-lg p-6 h-32 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity shadow">
              <h2 className="text-white text-xl font-semibold">去出题</h2>
              <div className="flex space-x-4">
                <span className="text-yellow-300 text-2xl">👇</span>
                <span className="text-yellow-300 text-2xl">👉</span>
                <span className="text-yellow-300 text-2xl">👈</span>
              </div>
            </div>
          </Link>

          {/* 获得的奖励卡片 - 橙色 */}
          <Link href="/rewards" className="block">
            <div className="bg-[#D98C52] rounded-lg p-4 h-24 flex items-center cursor-pointer hover:opacity-90 transition-opacity shadow">
              <h2 className="text-white text-lg font-semibold">获得的奖励</h2>
            </div>
          </Link>
        </div>

        {/* 右列 */}
        <div className="space-y-6">
          {/* 出题记录卡片 - 蓝色 */}
          <Link href="/my-questions" className="block">
            <div className="bg-[#4A90E2] rounded-lg p-4 h-24 flex items-center cursor-pointer hover:opacity-90 transition-opacity shadow">
              <h2 className="text-white text-lg font-semibold">出题记录</h2>
            </div>
          </Link>

          {/* 答题记录卡片 - 蓝色 */}
          <Link href="/my-answers" className="block">
            <div className="bg-[#4A90E2] rounded-lg p-4 h-24 flex items-center cursor-pointer hover:opacity-90 transition-opacity shadow">
              <h2 className="text-white text-lg font-semibold">答题记录</h2>
            </div>
          </Link>

          {/* 发出的奖励卡片 - 橙色 */}
          <Link href="/rewards" className="block">
            <div className="bg-[#D98C52] rounded-lg p-4 h-24 flex items-center cursor-pointer hover:opacity-90 transition-opacity shadow">
              <h2 className="text-white text-lg font-semibold">发出的奖励</h2>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}