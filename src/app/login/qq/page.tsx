'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function QQLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查用户是否已登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');
      
      if (storedIsLoggedIn === 'true' && storedSocialUid) {
        // 如果用户已登录，重定向到主页
        router.push('/');
        return;
      }
      setCheckingLogin(false);
    };
    
    checkLoginStatus();
  }, [router]);

  useEffect(() => {
    if (!checkingLogin) { // 只有在確認用戶未登錄後才執行QQ登錄
      const handleQQLogin = async () => {
        const appKey = process.env.NEXT_PUBLIC_JUHE_Appkey;
        if (!appKey) {
          console.error('NEXT_PUBLIC_JUHE_Appkey 未定义');
          setError('系统配置错误：缺少AppKey');
          setLoading(false);
          return;
        }

        try {
          // 通过代理API获取登录URL，避免CORS问题
          const proxyUrl = `/api/proxy-login?appid=2428&appkey=${appKey}&type=qq&redirect_uri=${encodeURIComponent(window.location.origin + '/login/qq/callback')}`;
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `请求失败: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.code === 0) {
            // 跳转到登录URL
            window.location.href = data.url;
          } else {
            throw new Error(data.msg || '获取登录地址失败');
          }
        } catch (err: any) {
          console.error('登录请求失败:', err);
          setError(err.message || '登录请求失败');
          setLoading(false);
        }
      };

      handleQQLogin();
    }
  }, [checkingLogin, router]);

  if (checkingLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <p className="text-gray-700">检查登录状态中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Image 
              src="https://qq-web.cdn-go.cn/monorepo/f414dc61/zc.qq.com_v3/assets/qq-logo-t-50bcQd.svg" 
              alt="QQ图标" 
              width={100} 
              height={100} 
              className="w-20 h-20"
            />
          </div>
          <p className="text-lg text-gray-700">
            {loading ? '正在跳转到QQ登录...' : (error ? '错误：' + error : '跳转中...')}
          </p>
        </div>
      </div>
    </div>
  );
}