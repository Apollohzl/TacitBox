'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kValue, setKValue] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activityInfo, setActivityInfo] = useState<any>(null);
  const [participationData, setParticipationData] = useState<any[]>([]);
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

        if (!userResult.success) {
          // 如果获取用户信息失败，跳转到主页
          router.push('/');
          return;
        }

        setUserData(userResult.data);

        // 获取活动信息
	console.log("活动信息k=");
        const activityResponse = await fetch(`/api/quiz/activity-info?id=${encodeURIComponent(encodeURIComponent(k))}`);
        const activityResult = await activityResponse.json();

        if (!activityResult.success) {
          // 如果获取活动信息失败，跳转到主页
          router.push('/');
          return;
        }

        setActivityInfo(activityResult.activity);

        // 获取参与数据
        const participationResponse = await fetch(`/api/quiz/participations?activityId=${encodeURIComponent(encodeURIComponent(k))}`);
        const participationResult = await participationResponse.json();

        if (participationResult.success) {
          const participationList = participationResult.data.participations || [];
          
          // 为每个参与者获取用户详细信息
          const participantsWithDetails = await Promise.all(
            participationList.map(async (participation: any) => {
              try {
                const userDetailResponse = await fetch(
                  `/api/user/detail?social_uid=${participation.participant_user_id}&social_type=${participation.participant_user_type}`
                );
                const userDetailResult = await userDetailResponse.json();
                
                return {
                  ...participation,
                  userDetail: userDetailResult.success ? userDetailResult.data : null
                };
              } catch (error) {
                console.error('获取用户详情失败:', error);
                return {
                  ...participation,
                  userDetail: null
                };
              }
            })
          );
          
          setParticipationData(participantsWithDetails);
        } else {
          setParticipationData([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('获取数据失败:', error);
        // 发生错误时跳转到主页
        router.push('/');
        setLoading(false);
      }
    };

    fetchData();

    // 设置定时器，每10秒刷新一次活动信息
    const intervalId = setInterval(async () => {
      const k = searchParams.get('k');
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

        // 获取活动信息
        const activityResponse = await fetch(`/api/quiz/activity-info?id=${encodeURIComponent(encodeURIComponent(k))}`);
        const activityResult = await activityResponse.json();

        if (!activityResult.success) {
          // 如果获取活动信息失败，跳转到主页
          router.push('/');
          return;
        }

        setActivityInfo(activityResult.activity);

        // 获取参与数据
        const participationResponse = await fetch(`/api/quiz/participations?activityId=${encodeURIComponent(encodeURIComponent(k))}`);
        const participationResult = await participationResponse.json();

        if (participationResult.success) {
          const participationList = participationResult.data.participations || [];
          
          // 为每个参与者获取用户详细信息
          const participantsWithDetails = await Promise.all(
            participationList.map(async (participation: any) => {
              try {
                const userDetailResponse = await fetch(
                  `/api/user/detail?social_uid=${participation.participant_user_id}&social_type=${participation.participant_user_type}`
                );
                const userDetailResult = await userDetailResponse.json();
                
                return {
                  ...participation,
                  userDetail: userDetailResult.success ? userDetailResult.data : null
                };
              } catch (error) {
                console.error('获取用户详情失败:', error);
                return {
                  ...participation,
                  userDetail: null
                };
              }
            })
          );
          
          setParticipationData(participantsWithDetails);
        } else {
          setParticipationData([]);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 发生错误时跳转到主页
        router.push('/');
      }
    }, 10000);

    // 组件卸载时清理定时器
    return () => {
      clearInterval(intervalId);
    };
  }, [searchParams, router]);

  // 计算统计数据
  const rewardTotal = activityInfo?.max_reward_count || 0;
  const answeredCount = activityInfo?.now_finish || 0;  // 使用now_finish字段获取已答题人数
  const rewardedCount = participationData.filter((p: any) => p.has_rewarded === 1 || p.has_rewarded === '1' || p.has_rewarded === true).length;  // 实际获奖人数

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
          {/* 上半部分：标题、默契度展示 */}
          <div className="text-center mb-4">
            {/* 主标题 */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {userData?.nickname || '用户'}与{activityInfo?.creator_nickname || 'TA'}的默契盒子测试卷
            </h2>
            
            {/* 默契度展示部分 */}
            <div className="flex items-center justify-center mb-6">
              {/* 左侧头像区域 */}
              <div className="flex flex-col items-center mr-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <img 
                    src={userData?.avatar_url || '/images/logo-192x192.png'} 
                    alt="你的头像" 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              
              {/* 连接线和爱心 */}
              <div className="flex items-center">
                <div className="w-16 h-1 bg-gray-400"></div>
                <div className="mx-1 flex items-center justify-center">
                  <svg className="w-14 h-14 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-white text-xs font-bold">
                    <span>85%</span>
                    <span>默契度</span>
                  </div>
                </div>
                <div className="w-16 h-1 bg-gray-400"></div>
              </div>
              
              {/* 右侧头像区域 */}
              <div className="flex flex-col items-center ml-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <img 
                    src={activityInfo?.creator_avatar_url || '/images/logo-192x192.png'} 
                    alt="对方头像" 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
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
            {/* 奖励图片和描述 */}
            <div className="flex items-center justify-center mb-4" style={{ marginTop: '15px', marginBottom: '15px' }}>
              {activityInfo?.reward_id ? (
                <div className="flex items-center space-x-4 w-full">
                  <img 
                    src={`/shareimages/${activityInfo?.reward_id}.png`} 
                    alt="奖励图片" 
                    className="h-full object-contain"
                    style={{ width: 'auto', maxHeight: '128px' }}
                  />
                  {activityInfo?.reward_description && (
                    <div className="text-yellow-500 font-bold text-lg flex-1 break-words">
                      {activityInfo?.reward_description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 w-full">暂无奖励信息</div>
              )}
            </div>
            
            {/* 按钮组 */}
            <div className="flex justify-center space-x-4 mb-4">
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-6 rounded-full text-sm"
                onClick={() => router.push('/quiz')}
              >
                我也去出题
              </button>
              <button
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-6 rounded-full text-sm"
                onClick={() => {}}
              >
                再答一次
              </button>
            </div>
          </div>
        </div>

        {/* 下半部分：好友默契排行榜 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">好友默契排行榜</h3>
          {participationData.length > 0 ? (
            <div className="space-y-3">
              {participationData
                .map((participation, index) => {
                  // P1: 排序逻辑 - 按correct_count降序，如果相等则按participation_time升序
                  return { ...participation, index };
                })
                .sort((a, b) => {
                  // 首先按correct_count降序排列
                  if (b.correct_count !== a.correct_count) {
                    return b.correct_count - a.correct_count;
                  }
                  // 如果correct_count相同，则按participation_time升序排列（越久的在前面）
                  return new Date(a.participation_time).getTime() - new Date(b.participation_time).getTime();
                })
                .map((participation, rankIndex) => {
                  const rank = rankIndex + 1;
                  const hasReward = participation.has_rewarded === 1 || participation.has_rewarded === '1' || participation.has_rewarded === true;
                  const correctCount = participation.correct_count;
                  const percentage = correctCount * 10; // P5: correct_count * 10
                  
                  // P4: 根据百分比获取对应文本
                  let descriptionText = '';
                  switch(percentage) {
                    case 100:
                      descriptionText = '全世界你最懂我！';
                      break;
                    case 90:
                      descriptionText = '我们之间只隔了一层窗户纸~';
                      break;
                    case 80:
                      descriptionText = '经受住了考验，真朋友无疑了~';
                      break;
                    case 70:
                      descriptionText = '默契度再高一点点，我就跟你走！';
                      break;
                    case 60:
                      descriptionText = '让我们的革命友谊再升华一下吧！';
                      break;
                    case 50:
                      descriptionText = '你保住了咋俩的革命友谊！';
                      break;
                    case 40:
                      descriptionText = '友谊的小船说翻就翻~';
                      break;
                    case 30:
                      descriptionText = '点赞之交是我们最深的交情！';
                      break;
                    case 20:
                      descriptionText = '你我本无缘，全靠朋友圈';
                      break;
                    case 10:
                      descriptionText = '扎心了老铁，我们见过吗？';
                      break;
                    case 0:
                      descriptionText = '你是如何完美避开所有正确答案的？';
                      break;
                    default:
                      // 对于其他情况，找到最接近的值
                      const closest = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].reduce((prev, curr) => 
                        Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
                      );
                      switch(closest) {
                        case 100: descriptionText = '全世界你最懂我！'; break;
                        case 90: descriptionText = '我们之间只隔了一层窗户纸~'; break;
                        case 80: descriptionText = '经受住了考验，真朋友无疑了~'; break;
                        case 70: descriptionText = '默契度再高一点点，我就跟你走！'; break;
                        case 60: descriptionText = '让我们的革命友谊再升华一下吧！'; break;
                        case 50: descriptionText = '你保住了咋俩的革命友谊！'; break;
                        case 40: descriptionText = '友谊的小船说翻就翻~'; break;
                        case 30: descriptionText = '点赞之交是我们最深的交情！'; break;
                        case 20: descriptionText = '你我本无缘，全靠朋友圈'; break;
                        case 10: descriptionText = '扎心了老铁，我们见过吗？'; break;
                        case 0: descriptionText = '你是如何完美避开所有正确答案的？'; break;
                        default: descriptionText = '未知默契度';
                      }
                  }
                  
                  // 获取用户头像和昵称
                  const userAvatar = participation.userDetail?.avatar_url || ''; // 用户头像
                  const userNickname = participation.userDetail?.nickname || "未知用户昵称"; // 用户昵称
                  
                  return (
                    <div key={participation.participant_user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      {/* 左侧: 排名, 头像, 信息 */}
                      <div className="flex items-center flex-1">
                        {/* a. 排名显示 */}
                        <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                          {rank === 1 ? (
                            <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-white font-bold">
                              {rank}
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-8 h-8 bg-gray-400 rounded-md flex items-center justify-center text-white font-bold">
                              {rank}
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-8 h-8 bg-yellow-800 rounded-md flex items-center justify-center text-white font-bold">
                              {rank}
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                              {rank}
                            </div>
                          )}
                        </div>
                        
                        {/* b. 用户头像 */}
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mr-4 flex-shrink-0">
                          <img 
                            src={userAvatar} 
                            alt="用户头像" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        
                        {/* c. 用户信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-800 truncate">{userNickname}</span>
                            {/* "查看答案"按钮，添加动画效果 */}
                            <button 
                              className="text-xs bg-green-500 text-white py-1 px-2 rounded-full border border-green-500 hover:bg-green-600 animate-pulse"
                              style={{
                                animationDuration: '0.5s'
                              }}
                            >
                              查看答案
                            </button>
                          </div>
                          <div className={`text-sm mb-1 ${hasReward ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {hasReward ? `已获得${activityInfo?.reward_name || '奖励'}奖励` : '未获得奖励'}
                          </div>
                          <div className={`text-sm ${hasReward ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {descriptionText}
                          </div>
                        </div>
                      </div>
                      
                      {/* d. 答题结果 */}
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-yellow-500 font-bold">{percentage}%</div>
                        <div className="text-gray-500 text-sm">答对{correctCount}题</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">暂无好友参与数据</div>
          )}
        </div>
      </div>
    </div>
  );
}