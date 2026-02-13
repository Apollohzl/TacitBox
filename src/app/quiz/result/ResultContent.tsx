'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 检查浏览器中是否有登录信息
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasSocialUid = localStorage.getItem('social_uid') !== null;
    
    if (!isLoggedIn || !hasSocialUid) {
      // 没有登录信息，跳转到登录页面
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">答题结果</h1>
        <p className="text-lg text-gray-600 mb-8">已跳转大体结果页</p>
        <button
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          onClick={() => router.push('/')}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}