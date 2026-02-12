'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TodoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityInfo, setActivityInfo] = useState<any>(null);
  
  const k = searchParams.get('k');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');
      
      if (storedIsLoggedIn === 'true' && storedSocialUid) {
        setIsLoggedIn(true);
        
        // 获取活动信息
        if (k) {
          try {
            const response = await fetch(`/api/quiz/activity-info?id=${encodeURIComponent(k)}`);
            const result = await response.json();
            
            if (result.success) {
              setActivityInfo(result.activity);
            } else {
              setError('无法获取活动信息');
            }
          } catch (err) {
            console.error('获取活动信息失败:', err);
            setError('获取活动信息失败');
          }
        }
      } else {
        router.push('/login');
      }
      
      setLoading(false);
    };
    
    checkLoginStatus();
  }, [router, k]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">错误</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
            onClick={() => router.push('/')}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">测试详情</h1>
          
          {activityInfo ? (
            <div className="text-left">
              <h2 className="text-xl font-semibold mb-4">活动信息</h2>
              <p><span className="font-medium">活动ID:</span> {activityInfo.id}</p>
              <p><span className="font-medium">创建者:</span> {activityInfo.creator_user_id}</p>
              <p><span className="font-medium">奖励ID:</span> {activityInfo.reward_id}</p>
              <p><span className="font-medium">最少答对题数:</span> {activityInfo.min_correct}</p>
              <p><span className="font-medium">最大奖励数量:</span> {activityInfo.max_reward_count}</p>
            </div>
          ) : (
            <p>正在加载活动信息...</p>
          )}
          
          <div className="mt-8">
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all mr-4"
              onClick={() => {
                // 跳转到答题页面
                router.push(`/quiz?k=${encodeURIComponent(k || '')}`);
              }}
            >
              开始答题
            </button>
            <button
              className="bg-gray-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-600 transition-all"
              onClick={() => router.push('/')}
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}