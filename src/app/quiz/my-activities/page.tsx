'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyActivitiesPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      // 获取当前登录用户数据
      const storedSocialUid = localStorage.getItem('social_uid');
      const storedLoginType = localStorage.getItem('login_type') || 'wx';

      if (!storedSocialUid) {
        router.push('/');
        return;
      }

      try {
        // 获取用户信息
        const userResponse = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${storedLoginType}`);
        const userResult = await userResponse.json();

        if (!userResult.success) {
          router.push('/');
          return;
        }

        setUserData(userResult.data);

        // 获取用户的出题记录
        const activitiesResponse = await fetch(`/api/quiz/my-activities?social_uid=${storedSocialUid}&social_type=${storedLoginType}`);
        const activitiesResult = await activitiesResponse.json();

        if (activitiesResult.success) {
          setActivities(activitiesResult.data.activities || []);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handleViewDetail = (activityId: string) => {
    const shareUrl = `https://tb.vicral.cn/quiz/share?k=${encodeURIComponent(activityId)}`;
    window.open(shareUrl, '_blank');
  };

  // 计算分页
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </header>

        {/* 出题记录列表 */}
        {currentActivities.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleViewDetail(activity.id)}
                >
                  {/* 第一行：粗体黑色文字 */}
                  <div className="font-bold text-black text-lg mb-2">
                    10道题，答对{activity.min_correct || 0}题可获得奖励
                  </div>
                  
                  {/* 第二行：小字金色显示奖励 */}
                  {activity.reward_name && (
                    <div className="text-sm text-yellow-600 mb-2">
                      奖励：{activity.reward_name} × 1
                    </div>
                  )}
                  
                  {/* 第三行：发布时间 */}
                  <div className="text-gray-500 text-sm mb-2">
                    {formatDate(activity.created_at)}
                  </div>
                  
                  {/* 第四行：统计信息 */}
                  <div className="text-gray-500 text-sm mb-4">
                    {activity.now_finish || 0}人答题 {activity.now_get_reward || 0}人获奖 还剩{activity.remaining_rewards || 0}个机会
                  </div>
                  
                  {/* 第五行：查看详情按钮 */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(activity.id);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    查看详情
                  </button>
                </div>
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
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