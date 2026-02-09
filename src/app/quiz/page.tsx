'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '../../context/QuizContext';

export default function QuizPage() {
  const router = useRouter();
  const { setQuizResults } = useQuiz();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{questionId: number, option: string, questionText: string, correctAnswer: string}[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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

  // 获取题库分类
  useEffect(() => {
    if (isLoggedIn) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/quiz/categories');
          const result = await response.json();
          
          if (result.success) {
            setCategories(result.data);
            if (result.data.length > 0 && !selectedCategory) {
              // 默认选择第一个分类
              const firstCategory = result.data[0];
              setSelectedCategory(firstCategory.name);
              setSelectedCategoryId(firstCategory.id);
            }
          } else {
            setError('获取题库分类失败');
          }
        } catch (err) {
          console.error('获取题库分类失败:', err);
          setError('获取题库分类失败');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCategories();
    }
  }, [isLoggedIn, selectedCategory]);

  // 获取当前分类的题目
  useEffect(() => {
    if (selectedCategoryId && isLoggedIn) {
      const fetchCategoryQuestions = async () => {
        try {
          const response = await fetch(`/api/quiz/questions?categoryId=${selectedCategoryId}&limit=10`);
          const result = await response.json();
          
          if (result.success) {
            setCategoryQuestions(result.data);
            // 如果还没有选择题目，则初始化前10个题目
            if (selectedQuestions.length === 0) {
              setSelectedQuestions(result.data);
              if (result.data.length > 0) {
                setCurrentQuestion(result.data[0]);
              }
            }
          } else {
            setError('获取题目失败');
          }
        } catch (err) {
          console.error('获取题目失败:', err);
          setError('获取题目失败');
        }
      };
      
      fetchCategoryQuestions();
    }
  }, [selectedCategoryId, isLoggedIn, selectedQuestions.length]);

  // 处理选项选择
  const handleOptionSelect = (option: string) => {
    // 设置选中的选项
    setSelectedOption(option);
    
    // 将当前选择保存到数组中
    const currentQ = selectedQuestions[currentQuestionIndex];
    const correctAnswer = currentQ?.correct_answer || '';
    const questionText = currentQ?.question_text || '';
    const questionId = currentQ?.id || 0;
    
    const newSelection = {
      questionId,
      option,
      questionText,
      correctAnswer
    };
    
    // 使用函数式更新来确保获取到最新的状态
    setSelectedOptions(prev => {
      const updatedOptions = [...prev, newSelection];
      
      // 等待1秒后执行后续操作
      setTimeout(() => {
        // 如果还没到第10题，则切换到下一题
        if (currentQuestionIndex < 9) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          if (selectedQuestions[currentQuestionIndex + 1]) {
            setCurrentQuestion(selectedQuestions[currentQuestionIndex + 1]);
          }
          // 重置选中选项状态以便下一题使用
          setSelectedOption(null);
        } else {
          // 选择完10题后，将答案信息存储在全局上下文中
          const resultsData = {
            selectedOptions: updatedOptions,
            questions: selectedQuestions.slice(0, 10)
          };
          setQuizResults(resultsData);
          router.push('/quiz/result');
        }
      }, 1000);
      
      return updatedOptions;
    });
  };

  // 换一题功能
  const handleGetNewQuestion = async () => {
    if (!selectedCategoryId) return;
    
    try {
      const response = await fetch(`/api/quiz/random-question?categoryId=${selectedCategoryId}`);
      const result = await response.json();
      
      if (result.success) {
        const newQuestion = result.data;
        const newQuestions = [...selectedQuestions];
        newQuestions[currentQuestionIndex] = newQuestion;
        setSelectedQuestions(newQuestions);
        setCurrentQuestion(newQuestion);
      } else {
        console.error('获取新题目失败:', result.error);
        // 使用模拟数据
        const mockNewQuestion = {
          id: Date.now(),
          question_text: `随机新题目 - ${selectedCategory}`,
          options: JSON.stringify(['选项A', '选项B', '选项C', '选项D']),
          difficulty: 'medium',
          is_active: true,
          created_at: new Date().toISOString()
        };
        const newQuestions = [...selectedQuestions];
        newQuestions[currentQuestionIndex] = mockNewQuestion;
        setSelectedQuestions(newQuestions);
        setCurrentQuestion(mockNewQuestion);
      }
    } catch (err) {
      console.error('获取新题目失败:', err);
      // 使用模拟数据
      const mockNewQuestion = {
        id: Date.now(),
        question_text: `随机新题目 - ${selectedCategory}`,
        options: JSON.stringify(['选项A', '选项B', '选项C', '选项D']),
        difficulty: 'medium',
        is_active: true,
        created_at: new Date().toISOString()
      };
      const newQuestions = [...selectedQuestions];
      newQuestions[currentQuestionIndex] = mockNewQuestion;
      setSelectedQuestions(newQuestions);
      setCurrentQuestion(mockNewQuestion);
    }
  };

  // 返回首页
  const handleGoHome = () => {
    router.push('/');
  };

  // 显示题库选择界面
  const handleShowCategorySelection = () => {
    // 保存当前选择的题目
    setShowCategorySelection(true);
  };

  // 从题库选择界面返回
  const handleReturnFromCategorySelection = () => {
    setShowCategorySelection(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">正在检查登录状态...</p>
      </div>
    );
  }

  if (loading && !selectedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-red-500 text-lg">错误: {error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h1 className="text-xl font-bold">题库选择</h1>
          </div>
          
          <div className="flex gap-4">
            {/* 左侧分类列表 */}
            <div className="w-1/3 bg-white rounded-lg shadow p-4 h-[500px] overflow-y-auto">
              <h2 className="font-bold mb-3">题库分类</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full py-2 px-4 rounded-lg text-left ${
                      selectedCategoryId === category.id 
                        ? 'bg-yellow-400 border-2 border-black' 
                        : 'bg-yellow-200 hover:bg-yellow-300'
                    }`}
                    onClick={async () => {
                      setSelectedCategory(category.name);
                      setSelectedCategoryId(category.id);
                      
                      // 获取新分类的题目
                      try {
                        const response = await fetch(`/api/quiz/questions?categoryId=${category.id}&limit=10`);
                        const result = await response.json();
                        
                        if (result.success) {
                          setCategoryQuestions(result.data);
                        }
                      } catch (err) {
                        console.error('获取分类题目失败:', err);
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 右侧题目列表 */}
            <div className="w-2/3 bg-white rounded-lg shadow p-4 h-[500px] overflow-y-auto">
              <h2 className="font-bold mb-3">题目列表 - {selectedCategory}</h2>
              <div className="space-y-3">
                {categoryQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className="bg-pink-100 p-4 rounded-lg cursor-pointer hover:bg-pink-200 transition-colors"
                    onClick={() => {
                      // 用选中的题目替换当前题目
                      const newQuestions = [...selectedQuestions];
                      newQuestions[currentQuestionIndex] = question;
                      setSelectedQuestions(newQuestions);
                      setCurrentQuestion(question);
                      setShowCategorySelection(false);
                    }}
                  >
                    <p className="font-medium">{question.question_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 底部返回按钮 */}
          <div className="mt-4 bg-white rounded-lg shadow p-4 flex justify-center">
            <button
              className="bg-pink-300 hover:bg-pink-400 py-2 px-6 rounded-lg"
              onClick={handleReturnFromCategorySelection}
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 题目展示框 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="text-sm text-gray-600 mb-2">题目 {currentQuestionIndex + 1}/10</div>
          <div className="bg-pink-300 rounded-lg p-4 min-h-[60px] flex items-center">
            <p className="text-lg font-medium">{currentQuestion?.question_text || '加载中...'}</p>
          </div>
        </div>

        {/* 选项区域 */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-4 mb-4 min-h-[200px]">
          <div className="space-y-3">
            {currentQuestion?.options ? 
              (typeof currentQuestion.options === 'string' ? 
                JSON.parse(currentQuestion.options) : 
                currentQuestion.options).map((option: string, index: number) => (
                <button
                  key={index}
                  className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-300 ${
                    selectedOption === option 
                      ? 'bg-green-500 text-white'  // 选中时的样式
                      : 'bg-white bg-opacity-80 hover:bg-opacity-100'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              )) :
              ['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4'].map((option, index) => (
                <button
                  key={index}
                  className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-300 ${
                    selectedOption === option 
                      ? 'bg-green-500 text-white'  // 选中时的样式
                      : 'bg-white bg-opacity-80 hover:bg-opacity-100'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))
            }
          </div>
        </div>

        {/* 底部控制栏 */}
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <button
            className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg"
            onClick={handleGoHome}
          >
            返回主页
          </button>
          
          <button
            className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg"
            onClick={handleShowCategorySelection}
          >
            题库选择
          </button>
          
          <button
            className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg flex items-center"
            onClick={handleGetNewQuestion}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            换一题
          </button>
        </div>
      </div>
    </div>
  );
}