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
          // 使用本地API获取用户详情（包含创建时间和登录时间）
          const localResponse = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${storedLoginType || 'wx'}`);
          if (localResponse.ok) {
            const localData = await localResponse.json();
            if (localData.success) {
              setUserData(localData.data);
              return;
            }
          }
          
          console.error('从本地API获取用户信息失败');
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

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('social_uid');
    // 重定向到首页
    router.push('/');
  };

  const handleAccountDeletion = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmAccountDeletion = async () => {
    if (!userData) return;
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          social_uid: userData.social_uid,
          social_type: userData.social_type
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('账户已成功注销');
        // 清除本地存储并重定向到首页
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('social_uid');
        localStorage.removeItem('login_type');
        router.push('/');
      } else {
        alert(`注销失败: ${result.message}`);
      }
    } catch (error) {
      console.error('注销账户时发生错误:', error);
      alert('注销账户时发生错误，请稍后重试');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const cancelAccountDeletion = () => {
    setShowDeleteConfirmation(false);
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
                {userData?.avatar_url ? (
                  <img 
                    src={userData.avatar_url} 
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
                    {userData?.social_type === 'wx' ? '微信' : userData?.social_type === 'qq' ? 'QQ' : '第三方'} 用户
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
                <span className="text-gray-900 font-medium text-sm sm:text-base">{userData?.social_type === 'wx' ? '微信' : userData?.social_type === 'qq' ? 'QQ' : userData?.social_type || '第三方'}</span>
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
                <span className="text-gray-900 font-medium text-sm sm:text-base">{userData?.last_login_at || '未知'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 注销账户按钮 */}
        <div className="mt-6 sm:mt-8 text-center">
          <button 
            onClick={handleAccountDeletion}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors border-2 border-red-300"
          >
            注销账户
          </button>
        </div>

        {/* 确认对话框 */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-4">确认注销账户</h3>
              <p className="text-gray-700 mb-6">您确定要注销账户吗？此操作将永久删除您的所有数据，且无法恢复。</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={confirmAccountDeletion}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  确认注销
                </button>
                <button
                  onClick={cancelAccountDeletion}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

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