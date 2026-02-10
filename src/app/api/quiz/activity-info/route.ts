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
    
    // 获取活动信息
    const [activities] = await connection.execute(
      'SELECT id, creator_user_id, title, questions, reward_id, min_correct, max_reward_count, created_at FROM quiz_activities WHERE id = ?',
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
    
    // 处理JSON字段
    let parsedQuestions = activity.questions;
    if (typeof activity.questions === 'string') {
      try {
        parsedQuestions = JSON.parse(activity.questions);
      } catch (e) {
        console.warn('解析题目JSON失败:', e);
        parsedQuestions = activity.questions; // 保持原始值
      }
    }

    return NextResponse.json({ 
      success: true,
      activity: {
        ...activity,
        questions: parsedQuestions
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