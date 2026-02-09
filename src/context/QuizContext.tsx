'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuizResult {
  questionId: number;
  option: string;
  questionText: string;
  correctAnswer: string;
}

interface QuizContextType {
  quizResults: {
    selectedOptions: QuizResult[];
    questions: any[];
  } | null;
  setQuizResults: (results: { selectedOptions: QuizResult[]; questions: any[] }) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizResults, setQuizResultsState] = useState<{
    selectedOptions: QuizResult[];
    questions: any[];
  } | null>(null);
  
  const router = useRouter();

  // 清除结果数据的函数
  const clearResults = () => {
    setQuizResultsState(null);
  };

  // 设置结果数据的函数
  const setQuizResults = (results: { selectedOptions: QuizResult[]; questions: any[] }) => {
    setQuizResultsState(results);
  };

  // 当用户访问结果页面时，如果URL参数存在，解析参数并存储到状态
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
      try {
        const decodedData = decodeURIComponent(atob(encodedData));
        const parsedResults = JSON.parse(decodedData);
        setQuizResultsState(parsedResults);
        
        // 清除URL参数，避免在地址栏显示大量数据
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (error) {
        console.error('解析测试结果失败:', error);
        router.push('/quiz');
      }
    }
  }, [router]);

  return (
    <QuizContext.Provider value={{ quizResults, setQuizResults }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}