'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuiz } from '../../../context/QuizContext';

export default function MyShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quizResults } = useQuiz();
  const [kValue, setKValue] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activityInfo, setActivityInfo] = useState<any>(null);
  const [participationData, setParticipationData] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const k = searchParams.get('k');
    setKValue(k);

    const fetchData = async () => {
      if (!k) {
        router.push('/');
        return;
      }

      try {
        // 获取当前登录用户数据
        const storedSocialUid = localStorage.getItem('social_uid');
        const storedLoginType = localStorage.getItem('login_type') || 'wx';

        if (!storedSocialUid) {
          router.push('/login');
          return;
        }

        const userResponse = await fetch(`/api/user/detail?social_uid=${storedSocialUid}&social_type=${storedLoginType}`);
        const userResult = await userResponse.json();

        if (userResult.success) {
          setUserData(userResult.data);
        }

        // 获取活动信息
        const activityResponse = await fetch(`/api/quiz/activity-info?id=${encodeURIComponent(k)}`);
        const activityResult = await activityResponse.json();

        if (activityResult.success) {
          setActivityInfo(activityResult.activity);
        }

        setLoading(false);
      } catch (error) {
        console.error('获取数据失败:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, router]);

  // 计算统计数据
  const rewardTotal = activityInfo?.max_reward_count || 0;
  const answeredCount = participationData.length;  // 这里需要从实际参与数据中获取
  const rewardedCount = participationData.filter((p: any) => p.has_rewarded).length;  // 实际获奖人数

  // 生成邀请图片的函数
  const generateInviteImage = async () => {
    if (!activityInfo || !userData || !kValue) return;
    
    setLoading(true);
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 设置画布尺寸 (1080x1350)
      canvas.width = 1080;
      canvas.height = 1350;
      
      // 绘制底片
      const backgroundImage = new Image();
      backgroundImage.crossOrigin = 'anonymous';
      backgroundImage.src = '/shareimages/dipian.png';
      
      await new Promise((resolve) => {
        backgroundImage.onload = () => {
          ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
          resolve(null);
        };
      });
      
      // 绘制头像
      if (userData.avatar_url) {
        const avatarImage = new Image();
        avatarImage.crossOrigin = 'anonymous';
        avatarImage.src = userData.avatar_url;
        
        await new Promise((resolve) => {
          avatarImage.onload = () => {
            // 绘制圆形头像
            ctx.save();
            ctx.beginPath();
            ctx.arc(414 + 125, 22 + 125, 125, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            
            ctx.drawImage(avatarImage, 414, 22, 250, 250);
            ctx.restore();
            resolve(null);
          };
        });
      }
      
      // 绘制标题
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(userData.nickname || '用户', canvas.width / 2, 320);
      
      // 绘制副标题
      ctx.font = '36px Arial';
      ctx.fillText('的默契盒子测试卷', canvas.width / 2, 380);
      
      // 绘制券图片
      if (activityInfo.reward_id) {
        const rewardImage = new Image();
        rewardImage.crossOrigin = 'anonymous';
        rewardImage.src = `/shareimages/${activityInfo.reward_id}.png`;
        
        await new Promise((resolve) => {
          rewardImage.onload = () => {
            ctx.drawImage(rewardImage, 430, 680, 472, 265.5);
            resolve(null);
          };
        });
      }
      
      // 生成二维码
      const response = await fetch(`https://uapis.cn/api/v1/image/qrcode?text=https://tb.vicral.cn/quiz/doorshare?k=${kValue}&size=204&format=json`);
      const qrcodeData = await response.json();
      
      if (qrcodeData.qrcode_base64) {
        const qrcodeImage = new Image();
        qrcodeImage.src = qrcodeData.qrcode_base64;
        
        await new Promise((resolve) => {
          qrcodeImage.onload = () => {
            ctx.drawImage(qrcodeImage, 776, 1051, 204, 204);
            resolve(null);
          };
        });
      }
      
      // 将canvas转换为图片
      const imageData = canvas.toDataURL('image/png');
      setGeneratedImage(imageData);
    } catch (error) {
      console.error('生成邀请图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理邀请好友答题模态框的打开
  const handleInviteModalOpen = () => {
    setShowInviteModal(true);
    // 延迟生成图片，确保模态框已打开
    setTimeout(() => {
      generateInviteImage();
    }, 100);
  };

  // 保存图片到本地
  const handleSaveImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `邀请好友答题_${Date.now()}.png`;
      link.click();
    }
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
        {/* 邮票形式的上半部分 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
          {/* 上半部分：头像、标题、统计数据 */}
          <div className="text-center mb-4">
            {/* 用户头像 */}
            <div className="flex justify-center mb-3">
              <div className="border-4 border-white rounded-full bg-gray-200 overflow-hidden shadow-lg">
                <img 
                  src={userData?.avatar_url || '/images/logo-192x192.png'} 
                  alt="用户头像" 
                  className="w-20 h-20 object-cover rounded-full"
                />
              </div>
            </div>
            
            {/* 标题 */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {userData?.nickname || '用户'}的默契盒子测试卷
            </h2>
            
            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-100 p-2 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{rewardTotal}</div>
                <div className="text-xs text-gray-600">奖励总份数</div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{answeredCount}</div>
                <div className="text-xs text-gray-600">已答题人数</div>
              </div>
              <div className="bg-gray-100 p-2 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{rewardedCount}</div>
                <div className="text-xs text-gray-600">已获奖人数</div>
              </div>
            </div>
          </div>
          
          {/* 分割虚线和半圆凹口 */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-300 border-dashed flex-grow"></div>
            <div className="absolute bg-white w-6 h-6 rounded-b-full border-b border-l border-r border-gray-300"></div>
            <div className="border-t border-gray-300 border-dashed flex-grow"></div>
          </div>
          
          {/* 下半部分：奖励信息和按钮 */}
          <div className="text-center">
            {/* 答题要求 */}
            <div className="text-gray-600 mb-3">
              答对
              <span className="text-red-500 font-bold">
                {activityInfo?.min_correct || 0}
              </span>
              题可获得我的奖励（先到先得）
            </div>
            
            {/* 奖励图片 */}
            <div className="mb-4" style={{ marginTop: '15px', marginBottom: '15px' }}>
              {activityInfo?.reward_id && (
                <img 
                  src={`/shareimages/${activityInfo.reward_id}.png`} 
                  alt="奖励图片" 
                  className="w-32 h-32 object-contain mx-auto"
		  style={{width: '600px'}}
                />
              )}
            </div>
            
            {/* 按钮组 */}
            <div className="grid grid-cols-4 gap-2">
              <button
                className="bg-gray-500 text-white py-2 px-3 rounded-lg text-sm"
                onClick={() => router.push('/')}
              >
                返回首页
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm"
                onClick={() => router.push('/quiz')}
              >
                重新出题
              </button>
              <button
                className="bg-green-500 text-white py-2 px-3 rounded-lg text-sm"
                onClick={handleInviteModalOpen}
              >
                邀请好友答题
              </button>
              <button
                className="bg-purple-500 text-white py-2 px-3 rounded-lg text-sm"
                onClick={() => setShowQuestionsModal(true)}
              >
                查看题目
              </button>
            </div>
          </div>
        </div>

        {/* 下半部分：好友参与信息 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">参与答题的好友信息</h3>
          <div className="text-center text-gray-500 py-8">
            暂无好友参与数据
          </div>
        </div>
      </div>

      {/* 邀请好友模态框 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">邀请好友答题</h3>
            {generatedImage ? (
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={generatedImage} 
                  alt="邀请好友答题图片" 
                  className="max-w-full max-h-80 object-contain border border-gray-200"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center mb-4">
                <p className="text-gray-500">正在生成图片...</p>
              </div>
            )}
            <p className="text-center text-gray-600 mb-4">长按保存图片，发送到朋友圈吧</p>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                onClick={handleSaveImage}
                disabled={!generatedImage}
              >
                保存图片
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={() => {
                  setShowInviteModal(false);
                  setGeneratedImage(null); // 重置生成的图片
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看题目模态框 */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">题目详情</h3>
            <div className="overflow-y-auto flex-grow">
              {activityInfo?.questions && activityInfo.questions.length > 0 ? (
                activityInfo.questions.map((question: any, index: number) => (
                  <div key={index} className="mb-4 p-3 border rounded-lg">
                    <div className="font-medium mb-2">题目 {index + 1}: {question.question_text}</div>
                    <div className="space-y-1">
                      {question.options && Array.isArray(question.options) ? (
                        question.options.map((option: string, optIndex: number) => {
                          const isCorrect = option === question.correct_answer;
                          return (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded ${isCorrect ? 'bg-green-100 border border-green-500' : 'bg-white border border-gray-300'}`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {isCorrect && <span className="text-green-600 ml-2">✓ 正确答案</span>}
                            </div>
                          );
                        })
                      ) : (
                        <p>选项加载失败</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>题目数据加载失败</p>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-lg"
                onClick={() => setShowQuestionsModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}