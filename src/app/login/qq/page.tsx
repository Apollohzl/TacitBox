'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

export default function QQLoginPage() {
  useEffect(() => {
    // 重定向到聚合登录的QQ登录页面
    const appKey = process.env.NEXT_PUBLIC_JUHE_Appkey;
    if (!appKey) {
      console.error('NEXT_PUBLIC_JUHE_Appkey 未定义');
      return;
    }
    
    const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://tb.vicral.cn'}/login/qq/callback`;
    window.location.href = `https://u.daib.cn/connect.php?act=login&appid=2423&appkey=${appKey}&type=qq&redirect_uri=${encodeURIComponent(redirectUrl)}`;
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
          <p className="text-lg text-gray-700">正在跳转到QQ登录...</p>
        </div>
      </div>
    </div>
  );
}