'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizResultPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查用户是否登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');
      
      if (storedIsLoggedIn === 'true' && storedSocialUid) {
        setIsLoggedIn(true);
      } else {
        router.push('/');
      }
    };
    
    checkLoginStatus();
  }, [router]);

  // 这里可以显示用户选择的题目信息
  const handleGoHome = () => {
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">测试结果</h1>
          <p className="text-lg mb-6">用户已选择完10道题目，这里显示测试结果。</p>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">选择的题目：</h2>
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded">
                  题目 {i + 1}: 模拟题目内容 {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
              onClick={handleGoHome}
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}