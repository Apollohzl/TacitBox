'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedSocialUid = localStorage.getItem('social_uid');
    const storedLoginType = localStorage.getItem('login_type'); // 获取登录类型

    if (storedIsLoggedIn === 'true' && storedSocialUid) {
      setIsLoggedIn(true);
      // 获取完整用户信息
      const fetchUserInfo = async () => {
        try {
          // 首先尝试从本地API获取用户详情（包含创建时间和登录时间）
          const localResponse = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${storedLoginType || 'wx'}`);
          if (localResponse.ok) {
            const localData = await localResponse.json();
            if (localData.success) {
              setUserData(localData.data);
              return;
            }
          }
          
          // 如果本地API获取失败，再从第三方API获取基本信息
          const loginType = storedLoginType || 'qq';
          const response = await fetch(`https://u.daib.cn/connect.php?act=query&appid=2423&appkey=5182677ea009b870808053105a2ded54&type=${loginType}&social_uid=${storedSocialUid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
              // 合并数据
              setUserData({
                ...data,
                created_at: '未知',
                last_login_at: '未知'
              });
            } else {
              console.error('获取用户信息失败:', data.msg);
            }
          } else {
            console.error('获取用户信息请求失败');
          }
        } catch (error) {
          console.error('获取用户信息出错:', error);
        }
      };
      
      fetchUserInfo();
    } else {
      // 如果未登录，重定向到首页
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('social_uid');
    // 重定向到首页
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">您需要先登录才能访问账号页面</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 页头 */}
        <header className="flex items-center justify-between py-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">账号设置</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </header>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* 头像 */}
              <div className="flex-shrink-0">
                {userData?.faceimg ? (
                  <img 
                    src={userData.faceimg} 
                    alt="用户头像" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-indigo-200 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 border-4 border-indigo-200 flex items-center justify-center">
                    <span className="text-gray-500 text-2xl sm:text-3xl">👤</span>
                  </div>
                )}
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {userData?.nickname || '未知用户'}
                </h2>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                    {userData?.type || 'QQ'} 用户
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                    已验证
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">性别</p>
                    <p className="font-medium text-sm sm:text-base">{userData?.gender || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">地区</p>
                    <p className="font-medium text-sm sm:text-base">{userData?.location || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">登录IP</p>
                    <p className="font-medium text-sm sm:text-base">{userData?.ip || '未获取'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">用户ID</p>
                    <div className="flex items-center">
                      <p className="font-mono text-xs break-all flex-1">
                        {showUserId ? (userData?.social_uid || '未获取') : (userData?.social_uid ? '●'.repeat(userData.social_uid.length) : '未获取')}
                      </p>
                      <button 
                        onClick={() => setShowUserId(!showUserId)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showUserId ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 账号功能选项 */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">账号安全</h3>
            <ul className="space-y-3">
              <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0">
                <span className="text-gray-700 text-sm sm:text-base">登录方式</span>
                <span className="text-gray-900 font-medium text-sm sm:text-base">{userData?.type || 'QQ'}</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0">
                <span className="text-gray-700 text-sm sm:text-base">账户状态</span>
                <span className="text-green-600 font-medium text-sm sm:text-base">正常</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0">
                <span className="text-gray-700 text-sm sm:text-base">账号创建时间</span>
                <span className="text-gray-900 font-medium text-sm sm:text-base">{userData?.created_at || '2024-01-01 12:00'}</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-0">
                <span className="text-gray-700 text-sm sm:text-base">最后登录时间</span>
                <span className="text-gray-900 font-medium text-sm sm:text-base">{userData?.last_login || new Date().toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 今日天气模块 */}
        <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">今日天气</h3>
          <div className="flex items-center justify-center">
            <WeatherDisplay />
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

// 天气组件
function WeatherDisplay() {
  const [weatherImage, setWeatherImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 首先获取用户位置
        const ipResponse = await fetch('https://uapis.cn/api/v1/network/myip?source=commercial');
        const ipData = await ipResponse.json();
        
        if (ipData && ipData.district) {
          // 使用获取到的district值获取天气信息
          const weatherResponse = await fetch(`https://api.lolimi.cn/API/weather/weather?query=${encodeURIComponent(ipData.district)}&days=8`);
          
          if (weatherResponse.ok) {
            const imageUrl = weatherResponse.url; // 直接使用响应的URL
            setWeatherImage(imageUrl);
          } else {
            throw new Error('获取天气数据失败');
          }
        } else {
          throw new Error('获取位置信息失败');
        }
      } catch (err) {
        console.error('获取天气信息失败:', err);
        setError('获取天气信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">正在获取天气信息...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="w-full">
      {weatherImage ? (
        <img 
          src={weatherImage} 
          alt="今日天气" 
          className="max-w-full h-auto rounded-lg"
        />
      ) : (
        <div className="text-center text-gray-500 py-4">暂无天气信息</div>
      )}
    </div>
  );
}