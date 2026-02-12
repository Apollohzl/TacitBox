import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少活动ID参数' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    // 获取活动信息，不包含 correct_answer
    const [activities] = await connection.execute(
      'SELECT id, creator_user_id, questions, reward_id, min_correct FROM quiz_activities WHERE id = ?',
      [id]
    ) as [any[], any];
    
    connection.release();

    if (activities.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '活动不存在' 
      }, { status: 404 });
    }

    const activity = activities[0];
    
    // 处理JSON字段并移除correct_answer
    let parsedQuestions = activity.questions;
    if (typeof activity.questions === 'string') {
      try {
        const fullQuestions = JSON.parse(activity.questions);
        // 移除每道题中的 correct_answer 字段
        parsedQuestions = fullQuestions.map((q: any) => {
          const { correct_answer, ...questionWithoutAnswer } = q;
          return questionWithoutAnswer;
        });
      } catch (e) {
        console.warn('解析题目JSON失败:', e);
        parsedQuestions = activity.questions; // 保持原始值
      }
    }

    return NextResponse.json({ 
      success: true,
      data: {
        questions: parsedQuestions,
        creator_user_id: activity.creator_user_id,
        reward_id: activity.reward_id,
        min_correct: activity.min_correct
      }
    });
  } catch (error) {
    console.error('获取活动信息时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}