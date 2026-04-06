import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const u = searchParams.get('u'); // participant_user_id
    const id = searchParams.get('id'); // activity_id

    if (!u || !id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数: u (participant_user_id) 和 id (activity_id)' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 获取参与记录（包含用户答案）
    const [participations] = await connection.execute(
      `SELECT answers, correct_count, participant_user_type
       FROM quiz_participations 
       WHERE activity_id = ? 
         AND participant_user_id = ?`,
      [id, u]
    ) as [any[], any];

    if (!participations || participations.length === 0) {
      return NextResponse.json({ success: false, error: '未找到答题记录' }, { status: 404 });
    }

    const participation = participations[0];
    
    // 安全地解析 answers - 可能是字符串或已经是对象
    let userAnswers;
    try {
      if (typeof participation.answers === 'string') {
        userAnswers = JSON.parse(participation.answers || '[]');
      } else if (typeof participation.answers === 'object') {
        userAnswers = participation.answers || [];
      } else {
        userAnswers = [];
      }
    } catch (parseError) {
      console.error('解析用户答案失败:', parseError);
      userAnswers = [];
    }

    // 获取活动信息（包含题目）
    const [activities] = await connection.execute(
      `SELECT questions 
       FROM quiz_activities 
       WHERE id = ?`,
      [id]
    ) as [any[], any];

    if (!activities || activities.length === 0) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 });
    }

    const activity = activities[0];
    
    // 安全地解析 questions - 可能是字符串或已经是对象
    let questions;
    try {
      if (typeof activity.questions === 'string') {
        questions = JSON.parse(activity.questions || '[]');
      } else if (typeof activity.questions === 'object') {
        questions = activity.questions || [];
      } else {
        questions = [];
      }
    } catch (parseError) {
      console.error('解析题目失败:', parseError);
      questions = [];
    }

    // 整合数据：提取每道题的题目、选项、用户答案、正确答案
    const results = questions.map((question: any, index: number) => {
      const userAnswer = userAnswers[index] || '';
      const correctAnswer = question.correct_answer || '';

      return {
        questionNumber: index + 1,
        questionText: question.question_text || '',
        options: question.options || [],
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: userAnswer === correctAnswer
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        participant_user_id: u,
        activity_id: id,
        questions: results,
        totalQuestions: questions.length,
        correctCount: participation.correct_count
      }
    });
  } catch (error: any) {
    console.error('获取用户答题数据时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || '服务器内部错误' 
    }, { status: 500 });
  } finally {
    // 确保连接被释放，无论是否发生错误
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('释放数据库连接时出错:', releaseError);
      }
    }
  }
}