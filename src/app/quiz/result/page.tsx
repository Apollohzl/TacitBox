'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '../../../context/QuizContext';

export default function QuizResultPage() {
  const router = useRouter();
  const { quizResults } = useQuiz();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查用户是否登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedSocialUid = localStorage.getItem('social_uid');
      
      if (storedIsLoggedIn === 'true' && storedSocialUid) {
        setIsLoggedIn(true);
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  if (!quizResults) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">测试结果</h1>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">答题详情：</h2>
            <div className="space-y-4">
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
                          {isCorrect ? '正确' : '错误'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
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