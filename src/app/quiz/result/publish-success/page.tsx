'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishSuccessPage() {
  const router = useRouter();

  // 可以在这里添加一些逻辑，如获取发布结果等
  useEffect(() => {
    // 检查是否已登录，如果没有则跳转到首页
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedIsLoggedIn !== 'true') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">题目发布成功！</h1>
          <p className="text-lg text-gray-600 mb-8">您的题目已成功发布，好友们现在可以尝试回答您的问题了。</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              onClick={() => router.push('/')}
            >
              返回首页
            </button>
            <button
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all"
              onClick={() => router.push('/quiz')}
            >
              继续答题
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}