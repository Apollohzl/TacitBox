import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const participantUserId = searchParams.get('participantUserId');
    const participantUserType = searchParams.get('participantUserType');

    if (!activityId || !participantUserId || !participantUserType) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数: activityId, participantUserId, participantUserType' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 获取活动信息（包含题目）
    const [activities] = await connection.execute(
      `SELECT questions, creator_user_id 
       FROM quiz_activities 
       WHERE activity_id = ?`,
      [encodeURIComponent(activityId)]
    ) as [any[], any];

    if (!activities || activities.length === 0) {
      return NextResponse.json({ success: false, message: '活动不存在' }, { status: 404 });
    }

    const activity = activities[0];
    const questions = JSON.parse(activity.questions || '[]');

    // 获取用户的参与记录
    const [participations] = await connection.execute(
      `SELECT answers, correct_count, participation_time
       FROM quiz_participations 
       WHERE activity_id = ? 
         AND participant_user_id = ? 
         AND participant_user_type = ?`,
      [encodeURIComponent(activityId), participantUserId, participantUserType]
    ) as [any[], any];

    if (!participations || participations.length === 0) {
      return NextResponse.json({ success: false, message: '未找到答题记录' }, { status: 404 });
    }

    const participation = participations[0];
    const userAnswers = JSON.parse(participation.answers || '[]');

    // 比对答案并生成结果
    const results = questions.map((question: any, index: number) => {
      const userAnswer = userAnswers[index] || '';
      const isCorrect = userAnswer === question.correct_answer;

      return {
        questionNumber: index + 1,
        questionText: question.question_text,
        options: question.options || [],
        userAnswer: userAnswer,
        isCorrect: isCorrect
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        questions: results,
        totalQuestions: questions.length,
        correctCount: participation.correct_count,
        participationTime: participation.participation_time
      }
    });
  } catch (error) {
    console.error('获取用户答题记录时发生错误:', error);
    return NextResponse.json({ success: false, message: '服务器内部错误' }, { status: 500 });
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