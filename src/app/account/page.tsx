'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedSocialUid = localStorage.getItem('social_uid');
    const storedLoginType = localStorage.getItem('loginType'); // 获取登录类型

    if (storedIsLoggedIn === 'true' && storedSocialUid) {
      setIsLoggedIn(true);
      // 获取完整用户信息
      const fetchUserInfo = async () => {
        try {
          // 使用实际的登录类型，如果不存在则默认为qq
          const loginType = storedLoginType || 'qq';
          const response = await fetch(`https://u.daib.cn/connect.php?act=query&appid=2423&appkey=5182677ea009b870808053105a2ded54&type=${loginType}&social_uid=${storedSocialUid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.code === 0) {
              setUserData(data);
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: "'MaShanZheng', 'Xiaolai Mono SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
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
                    <p className="text-gray-600 text-xs sm:text-sm">登录类型</p>
                    <p className="font-medium text-sm sm:text-base">{userData?.type || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">用户ID</p>
                    <p className="font-mono text-xs break-all">{userData?.social_uid || '未获取'}</p>
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
            </ul>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">登录历史</h3>
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-sm sm:text-base">暂未实现登录历史功能</p>
            </div>
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