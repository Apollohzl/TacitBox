'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [categories] = useState([
    '学校生活', '个人喜好', '游戏世界', '中奖率高', '美食口味', 
    '择偶标准', '你懂我吗', '性格特征', '心理匹配', '人际交往', 
    '有趣灵魂', '日常了解', '生活细节', '三观匹配', '情侣测试'
  ]);

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

  // 初始化题目
  useEffect(() => {
    if (isLoggedIn && !selectedCategory) {
      // 默认选择第一个分类
      setSelectedCategory(categories[0]);
    }
  }, [isLoggedIn, categories, selectedCategory]);

  // 获取题目（模拟数据）
  useEffect(() => {
    if (selectedCategory && isLoggedIn) {
      // 模拟从数据库获取题目的逻辑
      const mockQuestions = [
        { id: 1, text: '你最喜欢的食物是什么？', category: selectedCategory },
        { id: 2, text: '你理想的周末怎么度过？', category: selectedCategory },
        { id: 3, text: '你最想去哪里旅行？', category: selectedCategory },
        { id: 4, text: '你最喜欢的电影类型是什么？', category: selectedCategory },
        { id: 5, text: '你每天早上第一件事是什么？', category: selectedCategory },
        { id: 6, text: '你觉得自己最大的优点是什么？', category: selectedCategory },
        { id: 7, text: '你最不能容忍别人什么行为？', category: selectedCategory },
        { id: 8, text: '你理想中的另一半是什么样的？', category: selectedCategory },
        { id: 9, text: '你最害怕的是什么？', category: selectedCategory },
        { id: 10, text: '你认为幸福的定义是什么？', category: selectedCategory },
      ];
      
      if (selectedQuestions.length === 0) {
        setSelectedQuestions(mockQuestions);
        setCurrentQuestion(mockQuestions[0]);
      }
    }
  }, [selectedCategory, isLoggedIn, selectedQuestions.length]);

  // 处理选项选择
  const handleOptionSelect = (option: string) => {
    // 模拟选择选项后的行为，0.5秒后切换到下一题
    setTimeout(() => {
      if (currentQuestionIndex < 9) { // 最多10题
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestion(selectedQuestions[currentQuestionIndex + 1]);
      } else {
        // 选择完10题后，跳转到结果页面
        router.push('/quiz/result');
      }
    }, 500);
  };

  // 换一题功能
  const handleGetNewQuestion = async () => {
    if (!selectedCategory) return;
    
    // 这里模拟请求同分类下的随机题目
    const mockNewQuestion = {
      id: Date.now(), // 使用时间戳作为唯一ID
      text: `随机新题目 - ${selectedCategory}`,
      category: selectedCategory
    };
    
    const newQuestions = [...selectedQuestions];
    newQuestions[currentQuestionIndex] = mockNewQuestion;
    setSelectedQuestions(newQuestions);
    setCurrentQuestion(mockNewQuestion);
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
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`w-full py-2 px-4 rounded-lg text-left ${
                      selectedCategory === category 
                        ? 'bg-yellow-400 border-2 border-black' 
                        : 'bg-yellow-200 hover:bg-yellow-300'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 右侧题目列表 */}
            <div className="w-2/3 bg-white rounded-lg shadow p-4 h-[500px] overflow-y-auto">
              <h2 className="font-bold mb-3">题目列表 - {selectedCategory}</h2>
              <div className="space-y-3">
                {selectedQuestions.slice(0, 10).map((question, index) => (
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
                    <p className="font-medium">{question.text}</p>
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
            <p className="text-lg font-medium">{currentQuestion?.text || '加载中...'}</p>
          </div>
        </div>

        {/* 选项区域 */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-4 mb-4 min-h-[200px]">
          <div className="space-y-3">
            {['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4'].map((option, index) => (
              <button
                key={index}
                className="w-full bg-white bg-opacity-80 hover:bg-opacity-100 py-3 px-4 rounded-lg text-left transition-all duration-300"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </button>
            ))}
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