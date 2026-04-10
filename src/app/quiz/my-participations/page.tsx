'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyParticipationsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [participations, setParticipations] = useState<any[]>([]);
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

        // 获取用户的答题记录
        const participationsResponse = await fetch(`/api/quiz/my-participations?social_uid=${storedSocialUid}&social_type=${storedLoginType}`);
        const participationsResult = await participationsResponse.json();

        if (participationsResult.success) {
          setParticipations(participationsResult.data.participations || []);
        } else {
          setParticipations([]);
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

  const handleReturnHome = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handleViewDetail = (activityId: string) => {
    const shareUrl = `https://tb.vicral.cn/quiz/share?k=${activityId}`;
    window.open(shareUrl, '_blank');
  };

  // 计算分页
  const totalPages = Math.ceil(participations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipations = participations.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-800">我的答题记录</h1>
          <button 
            onClick={handleReturnHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </header>

        {/* 答题记录列表 */}
        {currentParticipations.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentParticipations.map((participation) => (
                <div 
                  key={participation.id}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleViewDetail(participation.activity_id)}
                >
                  {/* 第一行：头像、昵称、时间 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center flex-1">
                      {/* 圆形头像 */}
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                        <img 
                          src={participation.creator_avatar_url || '/images/logo-192x192.png'} 
                          alt="出题者头像" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      {/* 黑色粗体显示昵称 */}
                      <div className="font-bold text-black text-lg">
                        {participation.creator_nickname || '朋友'}的默契测试试卷
                      </div>
                    </div>
                    {/* 灰色显示时间 */}
                    <div className="text-gray-500 text-sm">
                      {formatDate(participation.activity_created_at)}
                    </div>
                  </div>
                  
                  {/* 第二行：奖励状态 */}
                  {participation.has_rewarded && participation.reward_name ? (
                    <div className="text-base text-yellow-600 mb-2">
                      获得奖励：{participation.reward_name}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-2">
                      未获得奖励
                    </div>
                  )}
                  
                  {/* 第三行：答题统计 */}
                  <div className="text-gray-700 text-sm mb-4">
                    共10题 答对了{participation.correct_count || 0}题
                  </div>
                  
                  {/* 查看详情按钮 */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(participation.activity_id);
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
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无答题记录</h2>
            <p className="text-gray-600 mb-6">还没有参与过测试，快去答题吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}