'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyParticipationsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [participations, setParticipations] = useState<any[]>([]);
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

        // 获取用户的答题记录
        const participationsResponse = await fetch(`/api/quiz/my-participations?participant_user_id=${storedSocialUid}`);
        const participationsResult = await participationsResponse.json();

        if (participationsResult.success) {
          setParticipations(participationsResult.data.participations || []);
        } else {
          setParticipations([]);
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

  const getPercentage = (correctCount: number, totalQuestions: number = 10) => {
    return Math.round((correctCount / totalQuestions) * 100);
  };

  const getDescription = (percentage: number) => {
    const descriptions: { [key: number]: string } = {
      100: '全世界你最懂我！',
      90: '我们之间只隔了一层窗户纸~',
      80: '经受住了考验，真朋友无疑了~',
      70: '默契度再高一点点，我就跟你走！',
      60: '让我们的革命友谊再升华一下吧！',
      50: '你保住了咋俩的革命友谊！',
      40: '友谊的小船说翻就翻~',
      30: '点赞之交是我们最深的交情！',
      20: '你我本无缘，全靠朋友圈',
      10: '扎心了老铁，我们见过吗？',
      0: '你是如何完美避开所有正确答案的？'
    };

    if (descriptions[percentage]) {
      return descriptions[percentage];
    }

    // 找到最接近的值
    const closest = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].reduce((prev, curr) => 
      Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
    );
    return descriptions[closest] || '未知默契度';
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
        {participations.length > 0 ? (
          <div className="space-y-4">
            {participations.map((participation) => (
              <div 
                key={participation.id}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => router.push(`/quiz/result?k=${encodeURIComponent(participation.activity_id)}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {participation.creator_nickname || '朋友'}的默契盒子测试卷
                    </h3>
                    <div className="text-sm text-gray-600">
                      答题时间：{formatDate(participation.participation_time)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${participation.has_rewarded ? 'text-yellow-500' : 'text-blue-500'}`}>
                      {getPercentage(participation.correct_count || 0)}%
                    </div>
                    <div className="text-xs text-gray-500">默契度</div>
                  </div>
                </div>
                
                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {participation.correct_count || 0}
                    </div>
                    <div className="text-xs text-gray-600">答对题数</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${participation.has_rewarded ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {participation.has_rewarded ? '✓ 已获奖' : '未获奖'}
                    </div>
                    <div className="text-xs text-gray-600">获奖状态</div>
                  </div>
                </div>

                {/* 默契度描述 */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-700 font-medium">
                    {getDescription(getPercentage(participation.correct_count || 0))}
                  </div>
                </div>

                {/* 奖励信息 */}
                {participation.has_rewarded && participation.reward_name && (
                  <div className="mt-4 flex items-center bg-yellow-50 p-3 rounded-lg">
                    <img 
                      src={`/shareimages/${participation.reward_id}.png`} 
                      alt="奖励" 
                      className="w-12 h-12 object-contain mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {participation.reward_name}
                      </div>
                      {participation.reward_description && (
                        <div className="text-xs text-gray-600">
                          {participation.reward_description}
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
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无答题记录</h2>
            <p className="text-gray-600 mb-6">还没有参与过测试，快去答题吧！</p>
            <button 
              onClick={() => router.push('/quiz')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-8 rounded-full font-bold"
            >
              去找题目
            </button>
          </div>
        )}
      </div>
    </div>
  );
}