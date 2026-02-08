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

    const saveUserInfo = async () => {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoString));
        console.log("/success："+userInfo);

        // 检查位置信息是否为空，如果为空则获取位置
        let finalLocation = userInfo.location;
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
              social_uid: userInfo.social_uid,
              social_type: userInfo.social_type || 'wx',  // 默认为wx
              nickname: userInfo.nickname,
              avatar_url: userInfo.avatar_url,
              gender: userInfo.gender,
              location: finalLocation,
              access_token: userInfo.access_token,
              ip: userInfo.ip_address
            }),
          });

          if (!response.ok) {
            console.error('保存用户信息到数据库失败');
          }
        } catch (error) {
          console.error('保存用户信息到数据库时发生错误:', error);
        }

        // 只保存social_uid，并保存登录类型
        localStorage.setItem('social_uid', userInfo.social_uid);
        console.log("social_uid保存成功：值为【【"+userInfo.social_uid+"】】】");
        localStorage.setItem('isLoggedIn', 'true');
        console.log("isLoggedIn保存成功：值为【【"+"true"+"】】】");
        localStorage.setItem('login_type', 'wx');

        // 跳转到首页
        window.location.href = '/';
      } catch (error) {
        console.error('解析用户信息失败:', error);
        window.location.href = '/login?error=parse_error';
      }
    };

    saveUserInfo();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
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