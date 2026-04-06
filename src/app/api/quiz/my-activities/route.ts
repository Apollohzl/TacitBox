import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const socialUid = searchParams.get('social_uid');
    const loginType = searchParams.get('login_type');

    if (!socialUid || !loginType) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数: social_uid, login_type' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 从 users 表读取用户数据
    const [users] = await connection.execute(
      `SELECT 
        social_uid,
        nickname,
        published_activities,
        participated_activities
       FROM users 
       WHERE social_uid = ? AND login_type = ?`,
      [socialUid, loginType]
    ) as [any[], any];

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          activities: []
        }
      });
    }

    const user = users[0];
    const publishedActivities = user.published_activities || [];

    if (!publishedActivities || publishedActivities.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          activities: []
        }
      });
    }

    // 获取奖励信息
    const [rewards] = await connection.execute(
      `SELECT reward_id, name, reward_message 
       FROM quiz_rewards`
    ) as [any[], any];

    const rewardsMap = new Map();
    if (rewards) {
      rewards.forEach((reward: any) => {
        rewardsMap.set(reward.reward_id, reward);
      });
    }

    // 根据 published_activities 查询 quiz_activities 表
    const activitiesWithIds = await Promise.all(
      publishedActivities.map(async (activityId: string) => {
        try {
          const [activities] = await connection.execute(
            `SELECT 
              id,
              creator_user_id,
              questions,
              reward_id,
              min_correct,
              max_reward_count,
              created_at,
              updated_at,
              now_finish,
              creator_user_type,
              now_get_reward
             FROM quiz_activities 
             WHERE id = ?`,
            [activityId]
          ) as [any[], any];

          if (activities && activities.length > 0) {
            const activity = activities[0];
            return {
              ...activity,
              reward_name: rewardsMap.get(activity.reward_id)?.name || null,
              reward_description: rewardsMap.get(activity.reward_id)?.reward_message || null
            };
          }
          return null;
        } catch (error) {
          console.error(`查询活动 ${activityId} 失败:`, error);
          return null;
        }
      })
    );

    // 过滤掉 null 值并按创建时间倒序排列
    const validActivities = activitiesWithIds
      .filter((activity): activity is any => activity !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: {
        activities: validActivities
      }
    });
  } catch (error) {
    console.error('获取出题记录时发生错误:', error);
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