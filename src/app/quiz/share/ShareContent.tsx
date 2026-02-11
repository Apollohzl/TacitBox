'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QuizShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('正在加载...');

  useEffect(() => {
    const handleShareLogic = async () => {
      // 1. 检查是否有k参数
      const kValue = searchParams.get('k');
      
      if (!kValue) {
        // 1-false: 显示【数据异常】2秒->跳转主页
        setMessage('数据异常');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/');
        return;
      }

      // 2. 检查是否有用户登录信息
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const socialUid = localStorage.getItem('social_uid');
      
      if (!isLoggedIn || !socialUid) {
        // 2-false: 显示【未登录】2秒->跳转/login页面
        setMessage('未登录');
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/login');
        return;
      }

      try {
        // 3. 请求SQLPub获取目前登录的用户信息的published_activities，并判断里面是否有相同的k值
        const response = await fetch(`/api/user/detail?social_uid=${socialUid}&social_type=${localStorage.getItem('login_type') || 'wx'}`);
        const userData = await response.json();
        
        if (userData.success && userData.data && userData.data.published_activities) {
          const publishedActivities = userData.data.published_activities;
          // 判断里面是否有相同的k值
          // 需要考虑k值可能在数据库中以编码或未编码形式存储
          const kDecoded = decodeURIComponent(kValue);
          const kEncoded = encodeURIComponent(kDecoded); // 确保编码一致性
          
          const isFound = Array.isArray(publishedActivities) && 
            (publishedActivities.includes(kValue) || 
             publishedActivities.includes(kDecoded) ||
             publishedActivities.includes(kEncoded));
             
          if (isFound) {
            // 3-true: 跳转到/myshare
            router.push(`/quiz/myshare?k=${kEncoded}`);
          } else {
            // 3-false: 跳转到/doorshare
            router.push(`/quiz/doorshare?k=${kEncoded}`);
          }
        } else {
          // 如果没有published_activities数据，跳转到/doorshare
          const kEncoded = encodeURIComponent(kValue);
          router.push(`/quiz/doorshare?k=${kEncoded}`);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 发生错误时跳转到/doorshare
        router.push(`/quiz/doorshare?k=${encodeURIComponent(kValue)}`);
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