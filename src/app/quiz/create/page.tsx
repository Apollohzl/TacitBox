'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateQuizPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState('');
  const [minCorrect, setMinCorrect] = useState(8);
  const [rewardCount, setRewardCount] = useState(1);
  const [hasValidSource, setHasValidSource] = useState(true); // 默认允许访问
  
  // 模拟奖励券列表
  const rewardOptions = [
    { id: 'cofep', name: '咖啡券', description: '凭咖啡券找我领取午后咖啡' },
    { id: 'cinemap', name: '电影票', description: '凭此电影票找我一起看电影' },
    { id: 'sharemimiq', name: '分享秘密券', description: '凭此券找我分享一个秘密给你' },
    { id: 'askp', name: '提问券', description: '凭次券可向我提问一个问题' },
    { id: 'redbagp', name: '红包券', description: '凭此券可向我索要一个随机红包' },
  ];

  useEffect(() => {
    // 检查来源页面
    // 从document.referrer获取来源，但要注意这可能不可靠
    const referrer = document.referrer;
    
    // 检查是否从有效的页面跳转过来（包括quiz页面）
    const isValidSource = referrer && (
      referrer.includes(window.location.host) && // 确保是同一域名
      (referrer.includes('/quiz') || referrer.includes('/quiz/create')) // 从quiz页面或自身页面跳转
    );
    
    // 对于直接访问，我们仍允许，但可以在UI上提供导航提示
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
    } else {
      router.push('/');
    }
  }, [router]);

  const handleConfirm = async () => {
    if (!selectedReward) {
      alert('请选择奖励');
      return;
    }
    
    try {
      // 调用API发布活动
      const response = await fetch('/api/quiz/publish-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_user_id: userData.social_uid,
          questions: [ // 使用模拟数据，实际项目中应使用真实题目数据
            {
              question_text: "你最喜欢的颜色是什么？",
              options: ["红色", "蓝色", "绿色", "黄色"],
              correct_answer: "蓝色"
            },
            {
              question_text: "你最喜欢的食物是什么？",
              options: ["披萨", "寿司", "面条", "汉堡"],
              correct_answer: "面条"
            },
            {
              question_text: "你最喜欢的季节是？",
              options: ["春季", "夏季", "秋季", "冬季"],
              correct_answer: "秋季"
            },
            {
              question_text: "你最想去的地方是？",
              options: ["海滩", "山区", "城市", "乡村"],
              correct_answer: "山区"
            },
            {
              question_text: "你最喜欢的休闲活动是？",
              options: ["读书", "运动", "看电影", "游戏"],
              correct_answer: "读书"
            },
            {
              question_text: "你最擅长的技能是？",
              options: ["编程", "绘画", "音乐", "写作"],
              correct_answer: "编程"
            },
            {
              question_text: "你最重视的品质是？",
              options: ["诚实", "善良", "智慧", "勇敢"],
              correct_answer: "善良"
            },
            {
              question_text: "你的性格偏向是？",
              options: ["外向", "内向", "中间", "情境性"],
              correct_answer: "中间"
            },
            {
              question_text: "你最看重友谊中的什么？",
              options: ["信任", "理解", "支持", "陪伴"],
              correct_answer: "理解"
            },
            {
              question_text: "你的人生格言是？",
              options: ["努力", "坚持", "善良", "成长"],
              correct_answer: "成长"
            }
          ],
          reward_id: selectedReward, // 使用奖励ID字符串而不是数字索引
          min_correct: minCorrect,
          max_reward_count: rewardCount
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 跳转到push-success页面，传递生成的活动ID和奖励ID
        router.push(`/push-success?k=${result.activityId}&rewardId=${selectedReward}`);
      } else {
        alert('发布题目失败: ' + result.error);
        console.error('发布题目失败:', result.error);
      }
    } catch (error) {
      alert('发布题目失败');
      console.error('调用API发布题目失败:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <p className="text-lg">正在加载用户信息...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">设置奖励</h1>
          
          {/* 用户信息展示 */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <img 
                src={userData.avatar_url || '/images/logo-192x192.png'} 
                alt="用户头像" 
                width={80} 
                height={80} 
                className="w-20 h-20 rounded-full border-4 border-pink-300 object-cover"
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                {userData.nickname}
              </div>
            </div>
          </div>
          
          <p className="text-xl text-pink-500 font-semibold mb-8">
            有默契的好朋友才能获得你的奖励哦！！
          </p>
          
          {/* 奖励设置表单 */}
          <div className="space-y-6">
            <div className="bg-pink-50 p-4 rounded-xl">
              <label className="block text-gray-700 font-medium mb-2">奖励：</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {rewardOptions.map((reward) => (
                  <div 
                    key={reward.id}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedReward === reward.id 
                        ? 'border-pink-500 bg-pink-100' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setSelectedReward(reward.id)}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-200 rounded-full mx-auto flex items-center justify-center mb-1">
                        <span className="text-lg">🎁</span>
                      </div>
                      <span className="text-sm font-medium">{reward.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <label className="block text-gray-700 font-medium mb-2">至少答对：</label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    className={`py-2 rounded-lg ${
                      minCorrect === num 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-blue-100'
                    }`}
                    onClick={() => setMinCorrect(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block text-gray-700 font-medium mb-2">奖励份数：</label>
              <input
                type="number"
                min="1"
                max="100"
                value={rewardCount}
                onChange={(e) => setRewardCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
          
          {/* 确认出题按钮 */}
          <button
            className="mt-8 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-6 rounded-full text-lg shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
            onClick={handleConfirm}
          >
            确认出题
          </button>
        </div>
        
        {/* 底部导航 */}
        <div className="flex justify-center">
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