import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少必要参数 id' }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    const [activities] = await connection.execute(
      `SELECT id, creator_user_id, creator_user_type, questions, reward_id, reward_name, reward_description, 
              min_correct, max_reward_count, now_finish, now_get_reward, created_at, updated_at
       FROM quiz_activities 
       WHERE id = ?`,
      [id]
    ) as [any[], any];

    if (activities.length === 0) {
      return NextResponse.json({ success: false, error: '活动不存在' }, { status: 404 });
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
        id: activity.id,
        creator_user_id: activity.creator_user_id,
        creator_user_type: activity.creator_user_type,
        questions: parsedQuestions,
        reward_id: activity.reward_id,
        reward_name: activity.reward_name,
        reward_description: activity.reward_description,
        min_correct: activity.min_correct,
        max_reward_count: activity.max_reward_count,
        now_finish: activity.now_finish,
        now_get_reward: activity.now_get_reward,
        created_at: activity.created_at,
        updated_at: activity.updated_at
      }
    });
  } catch (error) {
    console.error('获取活动信息时发生错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
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