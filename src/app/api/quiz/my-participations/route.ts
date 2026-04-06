import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const participantUserId = searchParams.get('participant_user_id');

    if (!participantUserId) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数: participant_user_id' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 获取用户参与的所有测试，按参与时间倒序排列
    const [participations] = await connection.execute(
      `SELECT 
        p.id,
        p.activity_id,
        p.answers,
        p.correct_count,
        p.has_rewarded,
        p.participation_time,
        p.participant_user_type,
        a.creator_user_id,
        a.reward_id,
        a.min_correct
       FROM quiz_participations p
       INNER JOIN quiz_activities a ON p.activity_id = a.id
       WHERE p.participant_user_id = ?
       ORDER BY p.participation_time DESC`,
      [participantUserId]
    ) as [any[], any];

    if (!participations || participations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          participations: []
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

    // 为每个参与记录获取创建者信息和奖励信息
    const participationsWithDetails = await Promise.all(
      participations.map(async (participation: any) => {
        // 获取创建者信息
        const [creators] = await connection.execute(
          `SELECT social_uid, nickname 
           FROM users 
           WHERE social_uid = ?`,
          [participation.creator_user_id]
        ) as [any[], any];

        const creator = creators[0] || {};

        return {
          ...participation,
          creator_nickname: creator.nickname || '未知用户',
          reward_name: rewardsMap.get(participation.reward_id)?.name || null,
          reward_description: rewardsMap.get(participation.reward_id)?.reward_message || null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        participations: participationsWithDetails
      }
    });
  } catch (error) {
    console.error('获取答题记录时发生错误:', error);
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