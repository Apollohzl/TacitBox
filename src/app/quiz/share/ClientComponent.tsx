'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuiz } from '../../../context/QuizContext';

export default function QuizShareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quizResults } = useQuiz();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [activityInfo, setActivityInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 获取URL参数中的k值和活动信息
  useEffect(() => {
    const kValue = searchParams.get('k');
    
    // 检查是否有k参数
    if (!kValue) {
      // 如果没有k参数，跳转到主页
      router.push('/');
      return;
    }
    
    setShareId(kValue); // 设置分享ID
    
    // 检查用户是否登录
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedSocialUid = localStorage.getItem('social_uid');
    
    if (storedIsLoggedIn === 'true' && storedSocialUid) {
      setIsLoggedIn(true);
      
      // 获取用户数据
      const fetchUserInfo = async () => {
        try {
          const loginType = localStorage.getItem('login_type') || 'wx';
          const response = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${loginType}`);
          const localData = await response.json();
          
          if (localData.success) {
            setUserData({
              nickname: localData.data.nickname,
              avatar_url: localData.data.avatar_url,
              social_uid: storedSocialUid
            });
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      };
      
      fetchUserInfo();
    }
    
    // 获取活动信息（无论用户是否登录）
    const fetchActivityInfo = async () => {
      try {
        const response = await fetch(`/api/quiz/activity-info?id=${kValue}`);
        const data = await response.json();
        
        if (data.success) {
          setActivityInfo(data.activity);
        } else {
          console.error('获取活动信息失败:', data.error);
        }
      } catch (error) {
        console.error('获取活动信息失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityInfo();
  }, [router, searchParams]);

  // 检查是否有测验结果，如果没有则不跳转（允许访问分享页面）
  // 此页面可以访问，即使没有测验结果，因为它是分享页面

  const handleGoHome = () => {
    router.push('/');
  };

  const handlePublishQuiz = () => {
    // 跳转到发布成功页面（如果用户已登录）
    if (isLoggedIn) {
      router.push(`/push-success?k=${shareId}`);
    } else {
      // 如果用户未登录，跳转到首页
      router.push('/');
    }
  };

  if (!shareId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
        <p className="text-lg">正在检查访问权限...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">分享结果</h1>
          
          {/* 用户信息显示 */}
          {userData && (
            <div className="flex items-center justify-center mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex items-center">
                <img 
                  src={userData.avatar_url || '/images/logo-192x192.png'} 
                  alt="用户头像" 
                  width={60} 
                  height={60} 
                  className="w-15 h-15 rounded-full border-2 border-indigo-300 object-cover"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-800">{userData.nickname}</h2>
                  <p className="text-gray-600">用户ID: {userData.social_uid}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 分享ID显示 */}
          {shareId && (
            <div className="bg-gray-50 p-4 rounded-xl mb-8">
              <h3 className="font-bold text-gray-700 mb-2">分享链接ID:</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border break-all">{shareId}</p>
              <p className="text-xs text-gray-500 mt-2">这是您分享题目的专属ID</p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <p>正在加载题目信息...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activityInfo && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-700 mb-2">活动信息：</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">奖励ID:</span>
                      <p className="font-medium">{activityInfo.reward_id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">最少答对:</span>
                      <p className="font-medium">{activityInfo.min_correct} 题</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">最大奖励数:</span>
                      <p className="font-medium">{activityInfo.max_reward_count}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">创建时间:</span>
                      <p className="font-medium text-xs">{new Date(activityInfo.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold text-center text-gray-700">题目详情：</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                {quizResults ? (
                  // 如果有用户答题结果，显示答题详情
                  <>
                    <h3 className="text-lg font-semibold text-center text-gray-700">答题详情：</h3>
                    {quizResults.selectedOptions.map((selection: any, index: number) => {
                      const isCorrect = selection.option === selection.correctAnswer;
                      return (
                        <div key={index} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="font-medium mb-2">题目 {index + 1}: {selection.questionText}</div>
                          <div className="flex flex-wrap gap-4">
                            <div>
                              <span className="font-semibold">您的选择:</span> 
                              <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {selection.option}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold">正确答案:</span> 
                              <span className="ml-2 text-green-600">
                                {selection.correct_answer || selection.correctAnswer}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold">结果:</span> 
                              <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? '✓ 正确' : '✗ 错误'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : activityInfo ? (
                  // 如果没有用户答题结果但有活动信息，显示题目
                  <>
                    <h3 className="text-lg font-semibold text-center text-gray-700">题目列表：</h3>
                    {activityInfo.questions && Array.isArray(activityInfo.questions) ? (
                      activityInfo.questions.map((question: any, index: number) => (
                        <div key={index} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                          <div className="font-medium mb-2">题目 {index + 1}: {question.question_text}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options && Array.isArray(question.options) ? (
                              question.options.map((option: string, optIndex: number) => {
                                const isCorrect = option === question.correct_answer;
                                return (
                                  <div 
                                    key={optIndex} 
                                    className={`p-2 rounded-lg border ${
                                      isCorrect 
                                        ? 'border-green-500 bg-green-50 text-green-700 font-medium' 
                                        : 'border-gray-200 bg-gray-50'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                    {isCorrect && <span className="ml-2 text-green-600">✓ 正确答案</span>}
                                  </div>
                                );
                              })
                            ) : (
                              <p>题目选项加载失败</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>题目信息加载失败</p>
                    )}
                  </>
                ) : (
                  <p>暂无题目信息</p>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition-all"
              onClick={handlePublishQuiz}
            >
              发布题目
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all"
              onClick={handleGoHome}
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}