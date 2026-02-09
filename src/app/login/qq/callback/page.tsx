'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function QQLoginCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    if (!type || !code) {
      console.error('缺少必要的参数');
      window.location.href = '/login?error=missing_params';
      return;
    }

    // 通过Authorization Code获取用户信息
    const fetchUserInfo = async () => {
      try {
        const appKey = process.env.NEXT_PUBLIC_JUHE_Appkey;
        if (!appKey) {
          console.error('NEXT_PUBLIC_JUHE_Appkey 未定义');
          window.location.href = '/login?error=appkey_error';
          return;
        }

        // 使用代理API避免CORS问题
        const proxyUrl = `/api/proxy-callback?appid=1018&appkey=${appKey}&type=${type}&code=${code}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `请求失败: ${response.status}`);
        }

        const userData = await response.json();

        if (userData.code !== 0) {
          console.error('获取用户信息失败:', userData.msg);
          window.location.href = '/login?error=user_info_failed';
          return;
        }

        // 检查位置信息是否为空，如果为空则获取位置
        let finalLocation = userData.location;
        if (!finalLocation || finalLocation === "" || finalLocation === null) {
          try {
            const ipResponse = await fetch('https://uapis.cn/api/v1/network/myip?source=commercial');
            const ipData = await ipResponse.json();
            
            if (ipData && ipData.region && ipData.district) {
              finalLocation = `${ipData.region} ${ipData.district}`;
            }
          } catch (error) {
            console.error('获取位置信息失败:', error);
          }
        }

        // 将用户信息保存到数据库
        try {
          const response = await fetch('/api/user/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: userData.social_uid,
              social_type: 'qq',  // QQ登录
              nickname: userData.nickname,
              avatar_url: userData.faceimg,
              gender: userData.gender,
              location: finalLocation,
              access_token: userData.access_token,
              ip: userData.ip
            }),
          });

          if (!response.ok) {
            console.error('保存用户信息到数据库失败');
          }
        } catch (error) {
          console.error('保存用户信息到数据库时发生错误:', error);
        }

        // 将用户信息保存到localStorage（只保存social_uid和登录类型）
        localStorage.setItem('social_uid', userData.social_uid);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('login_type', 'qq');

        // 更新最后登录时间
        try {
          await fetch('/api/user/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              social_uid: userData.social_uid,
              social_type: 'qq'
            }),
          });
        } catch (error) {
          console.error('更新最后登录时间失败:', error);
        }

        // 跳转到首页
        window.location.href = '/';
      } catch (error) {
        console.error('处理登录回调时发生错误:', error);
        window.location.href = '/login?error=callback_error';
      }
    };

    fetchUserInfo();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700">QQ登录中，处理用户信息...</p>
        </div>
      </div>
    </div>
  );
}