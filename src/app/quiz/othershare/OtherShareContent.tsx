'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OtherShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const k = searchParams.get('k');
    
    // 检查浏览器中是否有登录信息
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasSocialUid = localStorage.getItem('social_uid') !== null;
    
    if (isLoggedIn && hasSocialUid) {
      // 有登录信息，跳转到 /quiz/todo 页面并传递编码后的k值
      if (k) {
        router.push(`/quiz/todo?k=${encodeURIComponent(k)}`);
      } else {
        // 如果没有k值，跳转到首页
        router.push('/');
      }
    } else {
      // 没有登录信息，跳转到登录页面
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">正在跳转...</p>
      </div>
    </div>
  );
}