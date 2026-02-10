'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface QuizResult {
  selectedOptions: {
    questionId: number;
    option: string;
    questionText: string;
    correctAnswer: string;
  }[];
  questions: any[];
}

interface ParticipationData {
  participant_unique_id: string;
  activity_id: string;
  answers: number[];  // 选项索引数组
  correct_count: number;
  has_rewarded: number;  // 0=false, 1=true
  is_reward_delivered: number;  // 0=false, 1=true
  participation_time: string;
}

interface QuizContextType {
  quizResults: QuizResult | null;
  setQuizResults: (results: QuizResult) => void;
  addParticipationData: (activityId: string, participantUniqueId: string, answers: number[], correctCount: number, hasRewarded: number) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

  // 添加参与数据到用户信息中
  const addParticipationData = async (activityId: string, participantUniqueId: string, answers: number[], correctCount: number, hasRewarded: number) => {
    try {
      const participationData: ParticipationData = {
        participant_unique_id: participantUniqueId,
        activity_id: activityId,
        answers: answers,
        correct_count: correctCount,
        has_rewarded: hasRewarded,
        is_reward_delivered: 0,  // 默认未兑现
        participation_time: new Date().toISOString()
      };

      // 获取当前用户ID
      const socialUid = localStorage.getItem('social_uid');
      if (!socialUid) {
        throw new Error('用户未登录');
      }

      // 调用API保存参与数据
      const response = await fetch('/api/user/save-participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          social_uid: socialUid,
          participation_data: participationData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存参与数据失败');
      }

      // 同时保存到参与记录表
      const participationResponse = await fetch('/api/quiz/save-participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: activityId,
          participant_user_id: socialUid,
          participant_unique_id: participantUniqueId,
          answers: answers,
          correct_count: correctCount,
          has_rewarded: hasRewarded
        }),
      });

      if (!participationResponse.ok) {
        const errorData = await participationResponse.json();
        throw new Error(errorData.error || '保存参与记录失败');
      }

      console.log('参与数据保存成功');
    } catch (error) {
      console.error('保存参与数据失败:', error);
      throw error;
    }
  };

  return (
    <QuizContext.Provider value={{ quizResults, setQuizResults, addParticipationData }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};