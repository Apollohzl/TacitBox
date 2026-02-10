'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PushSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 获取传入的k参数
  const kValue = searchParams.get('k');

  // 可以在这里添加一些逻辑，如获取发布结果等
  useEffect(() => {
    // 检查是否已登录，如果没有则跳转到首页
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedIsLoggedIn !== 'true') {
      router.push('/');
    }
  }, [router]);

  const handleViewDetails = () => {
    if (kValue) {
      // 跳转到分享页面并传递k参数
      router.push(`/quiz/share?k=${kValue}`);
    } else {
      // 如果没有k参数，跳转到首页
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">题目发布成功！</h1>
          <p className="text-lg text-gray-600 mb-8">您的题目已成功发布，好友们现在可以尝试回答您的问题了。</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              onClick={handleViewDetails}
            >
              查看详情
            </button>
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
              onClick={() => router.push('/')}
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}