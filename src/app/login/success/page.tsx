'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginSuccess() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userInfoString = searchParams.get('userInfo');

    if (!userInfoString) {
      window.location.href = '/login?error=missing_user_info';
      return;
    }

    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoString));

      // 将用户信息存储到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('isLoggedIn', 'true');

      // 跳转到首页
      window.location.href = '/';
    } catch (error) {
      console.error('解析用户信息失败:', error);
      window.location.href = '/login?error=parse_error';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700">登录成功，正在跳转...</p>
        </div>
      </div>
    </div>
  );
}