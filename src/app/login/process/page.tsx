'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProcessLogin() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    if (!type || !code) {
      window.location.href = '/login?error=missing_params';
      return;
    }

    // 重定向到服务器端API处理登录
    window.location.href = `/api/auth/callback?type=${type}&code=${code}`;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700">正在处理登录信息...</p>
        </div>
      </div>
    </div>
  );
}