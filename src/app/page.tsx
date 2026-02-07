import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#61f7c0' }}>
      <div className="text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">默契盒子</h1>
        <p className="text-xl md:text-2xl text-white mb-8">测试你和朋友间的默契程度</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-green-500 font-bold py-3 px-6 rounded-full text-lg hover:bg-gray-100 transition duration-300">
            开始游戏
          </button>
          <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-white hover:bg-opacity-20 transition duration-300">
            查看排行榜
          </button>
        </div>
      </div>
    </div>
  );
}