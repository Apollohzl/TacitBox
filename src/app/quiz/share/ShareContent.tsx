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
          // console.log("k参数值->"+kValue);
          // console.log("请求返回的[0]个数据->"+(Array.isArray(publishedActivities) ? publishedActivities[0] : 'N/A'));
          // 判断里面是否有相同的k值
          // URL中的k值会被自动解码，但数据库中可能以编码格式存储
          // 所以需要检查编码后的值和未编码的值
          const kEncodedInUrl = kValue; // URL参数已被自动解码，但变量名保持一致
          const kEncodedInDatabase = encodeURIComponent(kValue); // 数据库中可能存储的是编码格式
          
          const isFound = Array.isArray(publishedActivities) && 
            (publishedActivities.includes(kEncodedInUrl) || 
             publishedActivities.includes(kEncodedInDatabase));
             
          if (isFound) {
            // 3-true: 跳转到/myshare
            router.push(`/quiz/myshare?k=${encodeURIComponent(kValue)}`);
          } else {
            // 3-false: 跳转到/doorshare
            router.push(`/quiz/doorshare?k=${encodeURIComponent(kValue)}`);
          }
        } else {
          // 如果没有published_activities数据，跳转到/doorshare
          router.push(`/quiz/doorshare?k=${encodeURIComponent(kValue)}`);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 发生错误时跳转到/doorshare
        const kEncoded = encodeURIComponent(kValue);
        router.push(`/quiz/doorshare?k=${kEncoded}`);
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