'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function QQLoginPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleQQLogin = async () => {
      const appKey = process.env.NEXT_PUBLIC_JUHE_Appkey;
      if (!appKey) {
        console.error('NEXT_PUBLIC_JUHE_Appkey 未定义');
        setError('系统配置错误：缺少AppKey');
        setLoading(false);
        return;
      }

      try {
        // Step 1: 获取跳转登录地址
        const response = await fetch(
          `https://u.daib.cn/connect.php?act=login&appid=2423&appkey=${appKey}&type=qq&redirect_uri=${encodeURIComponent(window.location.origin + '/login/qq/callback')}`
        );

        const data = await response.json();

        if (data.code === 0) {
          // Step 2: 跳转到登录地址
          window.location.href = data.url;
        } else {
          setError(data.msg || '获取登录地址失败');
          setLoading(false);
        }
      } catch (err) {
        console.error('登录请求失败:', err);
        setError('网络错误，请稍后重试');
        setLoading(false);
      }
    };

    handleQQLogin();
  }, []);

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