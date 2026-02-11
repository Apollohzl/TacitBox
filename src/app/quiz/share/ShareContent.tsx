'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QuizShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('正在加载...');

  useEffect(() => {
    const handleShareLogic = async () => {
      // 1. 检查是否有k值
      const kValue = searchParams.get('k');
      
      if (!kValue) {
        // 1-false: 显示【数据异常】2秒->跳转主页
        setMessage('数据异常');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/');
        return;
      }

      // 2. 检查浏览器是否有用户登录数据
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const socialUid = localStorage.getItem('social_uid');
      
      if (!isLoggedIn || !socialUid) {
        // 3-false: 跳转到/othershare
        router.push(`/quiz/othershare?k=${encodeURIComponent(kValue)}`);
        return;
      }

      try {
        // 请求SQLPub获取目前登录的用户信息的published_activities
        const response = await fetch(`/api/user/detail?social_uid=${socialUid}&social_type=${localStorage.getItem('login_type') || 'wx'}`);
        const userData = await response.json();
        
        if (userData.success && userData.data && userData.data.published_activities) {
          const publishedActivities = userData.data.published_activities;
          // 判断里面是否有相同的k值
          if (Array.isArray(publishedActivities) && publishedActivities.includes(kValue)) {
            // 2-true: 跳转到/myshare
            router.push(`/quiz/myshare?k=${encodeURIComponent(kValue)}`);
          } else {
            // 3-false: 跳转到/othershare
            router.push(`/quiz/othershare?k=${encodeURIComponent(kValue)}`);
          }
        } else {
          // 如果没有published_activities数据，跳转到/othershare
          router.push(`/quiz/othershare?k=${encodeURIComponent(kValue)}`);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 发生错误时跳转到/othershare
        router.push(`/quiz/othershare?k=${encodeURIComponent(kValue)}`);
      }
    };

    handleShareLogic();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{message}</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}