'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyActivitiesPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 获取当前登录用户数据
      const storedSocialUid = localStorage.getItem('social_uid');
      const storedLoginType = localStorage.getItem('login_type') || 'wx';

      if (!storedSocialUid) {
        router.push('/login');
        return;
      }

      try {
        // 获取用户信息
        const userResponse = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${storedLoginType}`);
        const userResult = await userResponse.json();

        if (!userResult.success) {
          router.push('/login');
          return;
        }

        setUserData(userResult.data);

        // 获取用户的出题记录
        const activitiesResponse = await fetch(`/api/quiz/my-activities?creator_user_id=${storedSocialUid}`);
        const activitiesResult = await activitiesResponse.json();

        if (activitiesResult.success) {
          setActivities(activitiesResult.data.activities || []);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleReturnHome = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">正在加载...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 页头 */}
        <header className="flex items-center justify-between py-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">我的出题记录</h1>
          <button 
            onClick={handleReturnHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </header>

        {/* 出题记录列表 */}
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => router.push(`/quiz/myshare?k=${encodeURIComponent(activity.id)}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {userData?.nickname || '用户'}的默契盒子测试卷
                    </h3>
                    <div className="text-sm text-gray-600">
                      创建时间：{formatDate(activity.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-500">
                      {activity.now_finish || 0}
                    </div>
                    <div className="text-xs text-gray-500">参与人数</div>
                  </div>
                </div>
                
                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {activity.max_reward_count || 0}
                    </div>
                    <div className="text-xs text-gray-600">奖励总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-500">
                      {activity.rewarded_count || 0}
                    </div>
                    <div className="text-xs text-gray-600">已发放</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">
                      {activity.min_correct || 0}
                    </div>
                    <div className="text-xs text-gray-600">答对要求</div>
                  </div>
                </div>

                {/* 奖励信息 */}
                {activity.reward_id && (
                  <div className="mt-4 flex items-center bg-yellow-50 p-3 rounded-lg">
                    <img 
                      src={`/shareimages/${activity.reward_id}.png`} 
                      alt="奖励" 
                      className="w-12 h-12 object-contain mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {activity.reward_name || '奖励'}
                      </div>
                      {activity.reward_description && (
                        <div className="text-xs text-gray-600">
                          {activity.reward_description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无出题记录</h2>
            <p className="text-gray-600 mb-6">还没有创建过测试，快去出题吧！</p>
            <button 
              onClick={() => router.push('/quiz')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-8 rounded-full font-bold"
            >
              立即出题
            </button>
          </div>
        )}
      </div>
    </div>
  );
}