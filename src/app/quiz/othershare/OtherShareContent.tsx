'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OtherShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const checkParticipation = async () => {
      const k = searchParams.get('k');
      
      // 检查浏览器中是否有登录信息
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const socialUid = localStorage.getItem('social_uid');
      
      if (!isLoggedIn || !socialUid) {
        // 没有登录信息，跳转到登录页面
        router.push('/login');
        return;
      }
      
      if (!k) {
        // 如果没有k值，跳转到首页
        router.push('/');
        return;
      }
      
      try {
        // 请求API检查用户是否已参与活动
        const response = await fetch(`/api/quiz/has-participated?k=${encodeURIComponent(k)}&userId=${encodeURIComponent(socialUid)}`);
        const result = await response.json();
        
        if (result.success) {
          if (result.hasParticipated) {
            // 如果用户已参与，跳转到结果页面
            router.push(`/quiz/result?k=${encodeURIComponent(k)}`);
          } else {
            // 如果用户未参与，跳转到答题页面
            router.push(`/quiz/todo?k=${encodeURIComponent(k)}`);
          }
        } else {
          // API请求失败，也跳转到答题页面
          router.push(`/quiz/todo?k=${encodeURIComponent(k)}`);
        }
      } catch (error) {
        console.error('检查参与状态失败:', error);
        // 发生错误时，跳转到答题页面
        router.push(`/quiz/todo?k=${encodeURIComponent(k)}`);
      }
    };
    
    checkParticipation();
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