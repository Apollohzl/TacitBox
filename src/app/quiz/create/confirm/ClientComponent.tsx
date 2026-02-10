'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ConfirmQuizClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  
  useEffect(() => {
    // 检查来源页面
    // 从document.referrer获取来源，但要注意这可能不可靠
    const referrer = document.referrer;
    
    // 检查是否从有效的页面跳转过来
    const isValidSource = referrer && (
      referrer.includes(window.location.host) && // 确保是同一域名
      (referrer.includes('/quiz') || referrer.includes('/quiz/create')) // 从quiz页面或自身页面跳转
    );
    
    // 如果需要更严格限制，可以取消注释下面的代码
    // if (!isValidSource) {
    //   router.push('/quiz'); // 重定向到quiz页面
    //   return;
    // }
    
    // 检查登录状态
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
            const userData = {
              nickname: localData.data.nickname,
              avatar_url: localData.data.avatar_url,
              social_uid: storedSocialUid
            };
            
            // 调用API生成加密ID
            const idResponse = await fetch(`/api/user/generate-encrypted-id?social_uid=${storedSocialUid}`);
            const idResult = await idResponse.json();
            
            if (idResult.success) {
              // 模拟题目数据
              const mockQuestions = [
                {
                  id: 1,
                  question_text: "你最喜欢的颜色是什么？",
                  options: ["红色", "蓝色", "绿色", "黄色"],
                  correct_answer: "蓝色"
                },
                {
                  id: 2,
                  question_text: "你最喜欢的食物是什么？",
                  options: ["披萨", "寿司", "面条", "汉堡"],
                  correct_answer: "面条"
                },
                {
                  id: 3,
                  question_text: "你最喜欢的季节是？",
                  options: ["春季", "夏季", "秋季", "冬季"],
                  correct_answer: "秋季"
                },
                {
                  id: 4,
                  question_text: "你最想去的地方是？",
                  options: ["海滩", "山区", "城市", "乡村"],
                  correct_answer: "山区"
                },
                {
                  id: 5,
                  question_text: "你最喜欢的休闲活动是？",
                  options: ["读书", "运动", "看电影", "游戏"],
                  correct_answer: "读书"
                },
                {
                  id: 6,
                  question_text: "你最擅长的技能是？",
                  options: ["编程", "绘画", "音乐", "写作"],
                  correct_answer: "编程"
                },
                {
                  id: 7,
                  question_text: "你最重视的品质是？",
                  options: ["诚实", "善良", "智慧", "勇敢"],
                  correct_answer: "善良"
                },
                {
                  id: 8,
                  question_text: "你的性格偏向是？",
                  options: ["外向", "内向", "中间", "情境性"],
                  correct_answer: "中间"
                },
                {
                  id: 9,
                  question_text: "你最看重友谊中的什么？",
                  options: ["信任", "理解", "支持", "陪伴"],
                  correct_answer: "理解"
                },
                {
                  id: 10,
                  question_text: "你的人生格言是？",
                  options: ["努力", "坚持", "善良", "成长"],
                  correct_answer: "成长"
                }
              ];
              
              setQuizData({
                questions: mockQuestions,
                user: userData,
                selectedReward: 'coupon_1', // 默认奖励
                minCorrect: 8, // 默认最少正确数
                rewardCount: 1, // 默认奖励数量
                encryptedLink: idResult.encryptedId
              });
            } else {
              console.error('生成加密ID失败:', idResult.error);
            }
          }
        } catch (error) {
          console.error('获取用户数据失败:', error);
        }
      };
      
      fetchUserInfo();
    } else {
      router.push('/');
    }
  }, [router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
        <p className="text-lg">正在加载出题数据...</p>
      </div>
    );
  }

  // 获取奖励名称
  const getRewardName = (rewardId: string) => {
    const rewardMap: Record<string, string> = {
      'coupon_1': '咖啡券',
      'coupon_2': '电影票',
      'coupon_3': '餐厅券',
      'coupon_4': '购物券',
      'coupon_5': '游戏币'
    };
    return rewardMap[rewardId] || rewardId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">出题确认</h1>
          
          {/* 出题人信息 */}
          <div className="flex items-center justify-center mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="flex items-center">
              <Image 
                src={quizData.user.avatar_url || '/images/logo-192x192.png'} 
                alt="出题人头像" 
                width={60} 
                height={60} 
                className="w-15 h-15 rounded-full border-2 border-indigo-300 object-cover"
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-800">{quizData.user.nickname}</h2>
                <p className="text-gray-600">出题人ID: {quizData.user.social_uid}</p>
              </div>
            </div>
          </div>
          
          {/* 奖励信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-pink-50 p-4 rounded-xl text-center">
              <h3 className="font-bold text-gray-700">奖励</h3>
              <p className="text-lg text-pink-600">{getRewardName(quizData.selectedReward)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <h3 className="font-bold text-gray-700">至少答对</h3>
              <p className="text-lg text-blue-600">{quizData.minCorrect} 题</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <h3 className="font-bold text-gray-700">奖励份数</h3>
              <p className="text-lg text-yellow-600">{quizData.rewardCount} 份</p>
            </div>
          </div>
          
          {/* 加密链接 */}
          <div className="bg-gray-50 p-4 rounded-xl mb-8">
            <h3 className="font-bold text-gray-700 mb-2">加密链接:</h3>
            <p className="text-sm font-mono bg-white p-3 rounded border break-all">{quizData.encryptedLink}</p>
          </div>
          
          {/* 题目列表 */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-center text-gray-800">题目列表</h2>
            {quizData.questions.map((question: any, index: number) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start">
                  <div className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">{question.question_text}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {question.options.map((option: string, optIndex: number) => {
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
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 底部按钮 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition-all"
              onClick={() => {
                // 这里应该是发布题目的逻辑
                alert('题目已发布成功！');
                router.push('/quiz/create');
              }}
            >
              发布题目
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all"
              onClick={() => router.back()}
            >
              返回修改
            </button>
          </div>
        </div>
        
        {/* 底部导航 */}
        <div className="flex justify-between">
          <button
            className="bg-gray-200 hover:bg-gray-300 py-3 px-6 rounded-lg"
            onClick={() => router.push('/quiz')}
          >
            返回答题
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 py-3 px-6 rounded-lg"
            onClick={() => router.push('/')}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}