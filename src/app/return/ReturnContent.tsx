'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('正在加载用户信息。。。');

  useEffect(() => {
    const handleReturn = async () => {
      // 检查是否同时拥有type和code参数及数据
      const type = searchParams.get('type');
      const code = searchParams.get('code');

      if (!type || !code) {
        router.push('/login?error=回调数据失败');
        return;
      }

      try {
        // 调用服务器端API处理回调逻辑
        const response = await fetch(`/api/handle-callback?type=${type}&code=${code}`);
        const result = await response.json();

        if (!result.success) {
          router.push(`/login?error=${encodeURIComponent(result.error)}`);
          return;
        }

        // 获取用户信息
        const { type: userType, access_token, social_uid, faceimg, nickname, location, ip, gender } = result.userData;

        setMessage('正在保存用户信息...');

        // 将用户信息保存到数据库
        try {
          const saveResponse = await fetch('/api/user/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: social_uid,
              social_type: userType,  // 登录类型
              nickname: nickname,
              avatar_url: faceimg,
              gender: gender || '',  // 如果有性别信息
              location: location || '未知位置', // 使用从API获取的位置信息
              access_token: access_token,
              ip_address: ip
            }),
          });

          if (!saveResponse.ok) {
            console.error('保存用户信息到数据库失败');
          }
        } catch (error) {
          console.error('保存用户信息到数据库时发生错误:', error);
        }

        // 将用户信息保存到localStorage
        localStorage.setItem('social_uid', social_uid);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('login_type', userType);

        // 更新最后登录时间
        try {
          await fetch('/api/user/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: social_uid,
              social_type: userType
            }),
          });
        } catch (error) {
          console.error('更新最后登录时间失败:', error);
        }

        // 跳转到首页
        router.push('/');
      } catch (error) {
        console.error('处理登录回调时发生错误:', error);
        router.push(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : '未知错误')}`);
      }
    };

    handleReturn();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-cyan-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="animate-spin h-10 w-10 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-700">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}