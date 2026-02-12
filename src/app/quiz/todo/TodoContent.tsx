'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TodoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kValue = searchParams.get('k');
  const [currentView, setCurrentView] = useState<'cover' | 'quiz'>('cover'); // 'cover' for first interface, 'quiz' for second
  const [questions, setQuestions] = useState<any[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [rewardId, setRewardId] = useState<string>('');
  const [minCorrect, setMinCorrect] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const selectedAnswersRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check login status and fetch data
  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      // Check if user is logged in
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');

      if (storedIsLoggedIn !== 'true' || !storedSocialUid) {
        router.push('/login');
        return;
      }

      if (!kValue) {
        router.push('/');
        return;
      }

      try {
        // Fetch activity data
        const response = await fetch(`/api/quiz/todo-questions?id=${encodeURIComponent(kValue)}`);
        const result = await response.json();

        if (!result.success) {
          alert('获取题目失败');
          router.push('/');
          return;
        }

        setQuestions(result.data.questions);
        setRewardId(result.data.reward_id);
        setMinCorrect(result.data.min_correct);

        // Fetch creator info
        const creatorResponse = await fetch(`/api/user/detail?social_uid=${result.data.creator_user_id}&social_type=${result.data.creator_user_type}`);
        const creatorResult = await creatorResponse.json();

        if (!creatorResult.success) {
          alert('获取创建者信息失败');
          router.push('/');
          return;
        }

        setCreatorInfo(creatorResult.data);
        setLoading(false);

        // Start checking user session every 3 seconds
        intervalRef.current = setInterval(() => {
          const currentSocialUid = localStorage.getItem('social_uid');
          if (!currentSocialUid || currentSocialUid !== storedSocialUid) {
            alert('您未登录/用户信息错误');
            router.push('/');
          }
        }, 3000);

        // Start checking activity exists every 10 seconds
        checkIntervalRef.current = setInterval(async () => {
          try {
            const activityResponse = await fetch(`/api/quiz/todo-questions?id=${encodeURIComponent(kValue)}`);
            const activityResult = await activityResponse.json();
            if (!activityResult.success) {
              alert(activityResult.error || '活动不存在或已失效');
              router.push('/');
            }
          } catch (error) {
            alert('检查活动状态时出错');
            router.push('/');
          }
        }, 10000);
      } catch (error) {
        alert('加载数据失败');
        router.push('/');
      }
    };

    checkLoginAndFetchData();

    // Cleanup intervals on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [router, kValue]);

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) {
      return; // Prevent multiple selections for the same question
    }

    // 确保数组长度足够，如果不够则扩展
    const newSelectedAnswers = [...selectedAnswers];
    // 扩展数组到至少当前问题索引+1的长度
    while (newSelectedAnswers.length <= currentQuestionIndex) {
      newSelectedAnswers.push('');
    }
    // 记录当前题目的选择
    newSelectedAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
    selectedAnswersRef.current = newSelectedAnswers;

    // Change background color temporarily
    const optionElement = document.getElementById(`option-${currentQuestionIndex}-${option}`);
    if (optionElement) {
      optionElement.classList.add('bg-green-500', 'text-white');
      setTimeout(() => {
        optionElement.classList.remove('bg-green-500', 'text-white');
      }, 500);
    }

    // 检查是否是最后一题
    if (currentQuestionIndex === questions.length - 1) {
      // 如果是最后一题，提交结果
      setTimeout(() => {
        submitQuizResults();
      }, 500);
    } else {
      // 不是最后一题，移动到下一题
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 500);
    }
  };

  // Submit quiz results
  const submitQuizResults = async () => {
    setIsSubmitting(true);
    
    // 使用ref获取最新的答案数组
    const answersToSubmit = selectedAnswersRef.current;
    console.log('提交的selectedAnswers:', answersToSubmit);
    console.log('selectedAnswers长度:', answersToSubmit.length);
    
    try {
      const response = await fetch('/api/quiz/save-participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          k: kValue, // k值已進行過URL編碼
          participant_user_id: localStorage.getItem('social_uid'),
          answers: JSON.stringify(answersToSubmit) // 使用ref中的最新答案
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 成功後跳轉到othershare頁面
        router.push(`/quiz/othershare?k=${encodeURIComponent(kValue || '')}`);
      } else {
        // API請求失敗，顯示錯誤並返回主頁
        alert('提交失敗: ' + result.error);
        router.push('/');
      }
    } catch (error) {
      // API請求出錯，顯示錯誤並返回主頁
      alert('提交過程中發生錯誤: ' + (error instanceof Error ? error.message : '未知錯誤'));
      router.push('/');
    }
  };

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

  if (currentView === 'cover') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Red envelope design */}
          <div className="relative mx-auto w-64 h-80">
            {/* Bottom red rectangle */}
            <div className="absolute inset-0 bg-red-600 rounded-t-lg rounded-b-lg" style={{ height: '360px' }}></div>
            
            {/* Top red rectangle - now full width with no top margin */}
            <div className="absolute inset-0 bg-red-500 rounded-t-lg rounded-b-3xl pt-4">
              {/* Content inside the envelope */}
              <div className="px-4 h-full flex flex-col items-center justify-between pb-16">
                <div className="text-center">
                  <p className="text-yellow-400 text-sm">答对 {minCorrect} 题就可以获得奖励</p>
                  <p className="text-black text-sm mt-1">(数量有限，先到先得)</p>
                </div>
                
                {/* Creator's avatar */}
                <div className="flex justify-center">
                  <img 
                    src={creatorInfo?.avatar_url || '/images/logo-192x192.png'} 
                    alt="头像" 
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                </div>
                
                {/* Creator's nickname */}
                <p className="text-white">{creatorInfo?.nickname}</p>
                <p className="text-yellow-400 text-sm mt-1">发出的答题奖励</p>
                
                {/* Reward image */}
                <div className="mt-2 flex-grow flex items-center justify-center">
                  <img 
                    src={`/shareimages/${rewardId}.png`} 
                    alt="奖励" 
                    className="max-h-20 object-contain"
                  />
                </div>
              </div>
              
              {/* Golden circle with animation */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="animate-pulse w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold">答题</span>
                </div>
              </div>
            </div>
            
            {/* Click area to go to quiz */}
            <div 
              className="absolute inset-0 rounded-t-lg rounded-b-3xl cursor-pointer"
              onClick={() => setCurrentView('quiz')}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  const currentQuestion = questions[currentQuestionIndex];
  const userSocialUid = localStorage.getItem('social_uid');
  const userNickname = localStorage.getItem('nickname') || '用户';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Top section */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <div className="text-green-600 font-medium">
            {currentQuestionIndex + 1}/10
          </div>
          <div className="flex items-center">
            <img 
              src={localStorage.getItem('avatar_url') || '/images/logo-192x192.png'} 
              alt="头像" 
              className="w-8 h-8 rounded-full mr-2"
            />
            <span>{userNickname}</span>
          </div>
        </div>

        {/* Question section */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <p className="text-lg font-medium">{currentQuestion?.question_text}</p>
        </div>

        {/* Options section */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-4">
          <div className="space-y-3">
            {currentQuestion?.options?.map((option: string, index: number) => (
              <button
                key={index}
                id={`option-${currentQuestionIndex}-${option}`}
                className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-300 ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? 'bg-green-500 text-white'
                    : 'bg-white bg-opacity-80 hover:bg-opacity-100'
                }`}
                onClick={() => handleOptionSelect(option)}
                disabled={selectedAnswers[currentQuestionIndex] !== undefined}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </div>

        {/* Loading overlay when submitting */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>提交中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}