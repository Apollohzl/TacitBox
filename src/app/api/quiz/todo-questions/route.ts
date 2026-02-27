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
    
    // 获取活动信息和创建者信息
    const [activities] = await connection.execute(
      `SELECT qa.id, qa.questions, qa.reward_id, qa.min_correct, qa.max_reward_count, 
              qa.now_finish, qa.now_get_reward, qa.created_at, qa.updated_at,
              u.nickname as creator_nickname, u.avatar_url as creator_avatar_url,
              qa.creator_user_id, qa.creator_user_type
       FROM quiz_activities qa
       LEFT JOIN users u ON qa.creator_user_id = u.social_uid AND qa.creator_user_type = u.social_type
       WHERE qa.id = ?`,
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
      data: {
        questions: parsedQuestions,
        reward_id: activity.reward_id,
        min_correct: activity.min_correct,
        creator_user_id: activity.creator_user_id,
        creator_user_type: activity.creator_user_type,
        creator_nickname: activity.creator_nickname,
        creator_avatar_url: activity.creator_avatar_url
      }
    });
  } catch (error) {
    console.error('获取题目信息时发生错误:', error);
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