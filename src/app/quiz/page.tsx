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
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isCategoryManuallySelected, setIsCategoryManuallySelected] = useState(false);
  const [questionsHistory, setQuestionsHistory] = useState<any[]>([]); // 记录已经获取过的题目，避免重复
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{questionId: number, option: string, questionText: string, correctAnswer: string, options: string[]}[]>([]);
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
          const response = await fetch('/api/quiz/categories');
          const result = await response.json();
          
          if (result.success) {
            setCategories(result.data);
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
  }, [isLoggedIn]);

  // 初始化第一个随机题目（从随机分类）
  useEffect(() => {
    if (isLoggedIn && !currentQuestion) {
      const fetchRandomQuestion = async () => {
        try {
          const response = await fetch('/api/quiz/random-question-any');
          const result = await response.json();
          
          if (result.success) {
            const question = result.data;
            setCurrentQuestion(question);
            setQuestionsHistory([question]);
            // 设置当前题目所属的分类
            setSelectedCategory(question.category_name);
            setSelectedCategoryId(question.category_id);
          } else {
            setError('获取题目失败');
          }
        } catch (err) {
          console.error('获取题目失败:', err);
          setError('获取题目失败');
        }
      };
      
      fetchRandomQuestion();
    }
  }, [isLoggedIn, currentQuestion]);

  // 处理选项选择
  const handleOptionSelect = (option: string) => {
    // 防止重复选择同一题
    if (selectedOption !== null) {
      return; // 如果已经选择了选项，则不再处理
    }
    
    // 设置选中的选项
    setSelectedOption(option);
    
    // 将当前选择保存到数组中
    const currentQ = currentQuestion; // 使用当前题目而不是索引
    const questionText = currentQ?.question_text || '';
    const questionId = currentQ?.id || 0;
    const questionOptions = currentQ?.options ? 
      (typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options) : [];
    
    // 使用函数式更新来确保获取到最新的状态
    setSelectedOptions(prev => {
      // 检查当前问题是否已经存在于选项数组中，避免重复添加
      const isQuestionAlreadyAnswered = prev.some(selection => selection.questionId === questionId);
      
      if (isQuestionAlreadyAnswered) {
        return prev; // 如果已回答过此题，则直接返回当前状态
      }
      
      const newSelection = {
        questionId,
        option,
        questionText,
        correctAnswer: option, // 用户选择的选项即为正确答案
        options: questionOptions // 保存完整选项列表
      };
      
      const updatedOptions = [...prev, newSelection];
      
      // 如果已经选择了10道题，立即设置结果并跳转
      if (updatedOptions.length === 10) {
        const resultsData = {
          selectedOptions: updatedOptions,
          questions: updatedOptions.map(selection => ({ // 只使用用户选择的题目
            id: selection.questionId,
            question_text: selection.questionText,
            correct_answer: selection.correctAnswer,
            options: Array.isArray(selection.options) ? selection.options : [] // 确保选项是数组
          }))
        };
        // 同步设置数据，确保在跳转前数据已设置
        setQuizResults(resultsData);
        // 使用 setTimeout 来将路由跳转移动到下一个事件循环，确保状态已更新
        setTimeout(() => {
          router.push('/quiz/create');
        }, 0);
        
        // 不再继续执行后续操作
        return updatedOptions;
      }
      
      // 等待1秒后执行获取下一题的操作（如果不是第10题）
      setTimeout(async () => {
        try {
          // 确保selectedCategoryId存在
          if (selectedCategoryId) {
            const response = await fetch(`/api/quiz/random-question?categoryId=${selectedCategoryId}`);
            const result = await response.json();
            
            if (result.success) {
              // 检查是否已经出现过这个题目
              const isRepeated = questionsHistory.some(q => q.id === result.data.id);
              
              if (!isRepeated) {
                setCurrentQuestion(result.data);
                setQuestionsHistory(prev => [...prev, result.data]);
              } else {
                // 如果题目重复，再获取一次
                const retryResponse = await fetch(`/api/quiz/random-question?categoryId=${selectedCategoryId}`);
                const retryResult = await retryResponse.json();
                
                if (retryResult.success) {
                  setCurrentQuestion(retryResult.data);
                  setQuestionsHistory(prev => [...prev, retryResult.data]);
                } else {
                  // 如果再次失败，使用当前题目
                  setCurrentQuestion(result.data);
                  setQuestionsHistory(prev => [...prev, result.data]);
                }
              }
            } else {
              setError('获取题目失败');
            }
          }
          
          // 重置选中选项状态以便下一题使用
          setSelectedOption(null);
        } catch (err) {
          console.error('获取新题目失败:', err);
          setError('获取新题目失败');
        }
      }, 1000);
      
      return updatedOptions;
    });
  };

  // 换一题功能
  const handleGetNewQuestion = async () => {
    try {
      let response, result;
      
      // 如果用户手动选择了分类，则从固定分类获取题目
      if (isCategoryManuallySelected && selectedCategoryId) {
        response = await fetch(`/api/quiz/random-question?categoryId=${selectedCategoryId}`);
      } else {
        // 否则从随机分类获取题目
        response = await fetch('/api/quiz/random-question-any');
      }
      
      result = await response.json();
      
      if (result.success) {
        const newQuestion = result.data;
        setCurrentQuestion(newQuestion);
        // 更新历史记录，如果当前题目不在历史中
        setQuestionsHistory(prev => {
          const exists = prev.some(q => q.id === newQuestion.id);
          if (!exists) {
            return [...prev, newQuestion];
          }
          return prev;
        });
        // 如果是从随机分类获取的，更新当前分类信息
        if (!isCategoryManuallySelected) {
          setSelectedCategory(newQuestion.category_name);
          setSelectedCategoryId(newQuestion.category_id);
        }
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
        setCurrentQuestion(mockNewQuestion);
        setQuestionsHistory(prev => {
          const exists = prev.some(q => q.id === mockNewQuestion.id);
          if (!exists) {
            return [...prev, mockNewQuestion];
          }
          return prev;
        });
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
      setCurrentQuestion(mockNewQuestion);
      setQuestionsHistory(prev => {
        const exists = prev.some(q => q.id === mockNewQuestion.id);
        if (!exists) {
          return [...prev, mockNewQuestion];
        }
        return prev;
      });
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
                      setIsCategoryManuallySelected(true); // 标记为手动选择分类
                      
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
                                    // 设置当前题目
                                    setCurrentQuestion(question);
                                    setIsCategoryManuallySelected(true); // 标记为手动选择分类
                                    // 更新历史记录，如果当前题目不在历史中
                                    setQuestionsHistory(prev => {
                                      const exists = prev.some(q => q.id === question.id);
                                      if (!exists) {
                                        return [...prev, question];
                                      }
                                      return prev;
                                    });
                                    setShowCategorySelection(false);
                                  }}
                                >
                                  <p className="font-medium">{question.question_text}</p>
                                </div>                ))}
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
          <div className="text-sm text-gray-600 mb-2">题目 {selectedOptions.length + 1}/10</div>
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
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap justify-between items-center gap-2">
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