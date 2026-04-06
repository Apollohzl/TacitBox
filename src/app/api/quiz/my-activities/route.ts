import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const creatorUserId = searchParams.get('creator_user_id');

    if (!creatorUserId) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数: creator_user_id' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 获取用户创建的所有活动，按创建时间倒序排列
    const [activities] = await connection.execute(
      `SELECT 
        id,
        creator_user_id,
        reward_id,
        min_correct,
        max_reward_count,
        created_at,
        updated_at
       FROM quiz_activities 
       WHERE creator_user_id = ?
       ORDER BY created_at DESC`,
      [creatorUserId]
    ) as [any[], any];

    if (!activities || activities.length === 0) {
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

    // 为每个活动获取统计数据
    const activitiesWithStats = await Promise.all(
      activities.map(async (activity: any) => {
        // 获取该活动的参与人数
        const [participationStats] = await connection.execute(
          `SELECT 
            COUNT(*) as total_participations,
            SUM(CASE WHEN has_rewarded = 1 THEN 1 ELSE 0 END) as rewarded_count
           FROM quiz_participations 
           WHERE activity_id = ?`,
          [activity.id]
        ) as [any[], any];

        const stats = participationStats[0] || {};

        return {
          ...activity,
          now_finish: stats.total_participations || 0,
          rewarded_count: stats.rewarded_count || 0,
          reward_name: rewardsMap.get(activity.reward_id)?.name || null,
          reward_description: rewardsMap.get(activity.reward_id)?.reward_message || null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        activities: activitiesWithStats
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