'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '../../../context/QuizContext';
import Image from 'next/image';

export default function QuizResultPage() {
  const router = useRouter();
  const { quizResults } = useQuiz();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [encryptedLink, setEncryptedLink] = useState<string | null>(null);

  // 检查用户是否登录
  useEffect(() => {
    const checkLoginStatus = () => {
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
              
              // 生成加密链接
              const timestamp = Date.now();
              const username = localData.data.nickname || 'user';
              const unicodeStr = `${timestamp}${username}`;
              const encodedStr = encodeURIComponent(unicodeStr);
              
              // 模拟加密过程（实际项目中应该使用环境变量中的Go_To_Key）
              let encryptedValue = '';
              try {
                // 这里使用一个简单的模拟加密，实际项目中应使用环境变量中的Go_To_Key
                const go_to_key = process.env.GO_TO_KEY || 'default_key'; // 实际项目中将从环境变量获取
                encryptedValue = btoa(encodedStr + go_to_key).substring(0, 16); // 简单模拟
              } catch (e) {
                // 如果环境变量不可用，使用默认加密
                encryptedValue = btoa(encodedStr).substring(0, 16);
              }
              
              setEncryptedLink(encryptedValue);
            }
          } catch (error) {
            console.error('获取用户信息失败:', error);
          }
        };
        
        fetchUserInfo();
      } else {
        router.push('/');
      }
    };
    
    checkLoginStatus();
  }, [router]);

  // 检查是否有测验结果，如果没有则跳转回主页
  useEffect(() => {
    if (isLoggedIn && !quizResults) {
      // 如果没有找到结果数据，跳转回主页
      router.push('/quiz');
    }
  }, [isLoggedIn, quizResults, router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handlePublishQuiz = () => {
    // 跳转到发布成功页面
    router.push('/quiz/result/publish-success');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  if (!quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">测试结果</h1>
            <p className="text-lg mb-6">正在加载测试结果...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">测试结果</h1>
          
          {/* 用户信息显示 */}
          {userData && (
            <div className="flex items-center justify-center mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex items-center">
                <Image 
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
          
          {/* 加密链接显示 */}
          {encryptedLink && (
            <div className="bg-gray-50 p-4 rounded-xl mb-8">
              <h3 className="font-bold text-gray-700 mb-2">专属题目ID:</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border break-all">{encryptedLink}</p>
              <p className="text-xs text-gray-500 mt-2">这是您创建的题目的专属ID，可用于分享给好友</p>
            </div>
          )}
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-700">答题详情：</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
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
                          {selection.correctAnswer}
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
            </div>
          </div>
          
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