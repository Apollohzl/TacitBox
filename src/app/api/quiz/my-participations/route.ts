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
    const socialType = searchParams.get('social_type');

    if (!socialUid || !socialType) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要参数: social_uid, social_type' 
      }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 从 users 表读取用户数据
    const [users] = await connection.execute(
      `SELECT 
        social_uid,
        nickname,
        participated_activities
       FROM users 
       WHERE social_uid = ? AND social_type = ?`,
      [socialUid, socialType]
    ) as [any[], any];

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          participations: []
        }
      });
    }

    const user = users[0];
    const participatedActivities = user.participated_activities || [];

    if (!participatedActivities || participatedActivities.length === 0) {
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
       FROM quiz_reward`
    ) as [any[], any];

    const rewardsMap = new Map();
    if (rewards) {
      rewards.forEach((reward: any) => {
        rewardsMap.set(reward.reward_id, reward);
      });
    }

    // 根据 participated_activities 查询 quiz_participations 表（查询 participant_unique_id）
    const participationsWithDetails = await Promise.all(
      participatedActivities.map(async (participantUniqueId: string) => {
        try {
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
              a.creator_user_type,
              a.reward_id,
              a.min_correct,
              a.created_at as activity_created_at
             FROM quiz_participations p
             INNER JOIN quiz_activities a ON p.activity_id = a.id
             WHERE p.participant_unique_id = ?`,
            [participantUniqueId]
          ) as [any[], any];

          if (participations && participations.length > 0) {
            const participation = participations[0];
            
            // 获取创建者信息
            const [creators] = await connection.execute(
              `SELECT social_uid, nickname, avatar_url
               FROM users 
               WHERE social_uid = ? AND social_type = ?`,
              [participation.creator_user_id, participation.creator_user_type]
            ) as [any[], any];

            const creator = creators[0] || {};

            return {
              ...participation,
              creator_nickname: creator.nickname || '未知用户',
              creator_avatar_url: creator.avatar_url || null,
              reward_name: rewardsMap.get(participation.reward_id)?.name || null,
              reward_description: rewardsMap.get(participation.reward_id)?.reward_message || null
            };
          }
          return null;
        } catch (error) {
          console.error(`查询参与记录 ${participantUniqueId} 失败:`, error);
          return null;
        }
      })
    );

    // 过滤掉 null 值并按参与时间倒序排列
    const validParticipations = participationsWithDetails
      .filter((p): p is any => p !== null)
      .sort((a, b) => new Date(b.participation_time).getTime() - new Date(a.participation_time).getTime());

    return NextResponse.json({
      success: true,
      data: {
        participations: validParticipations
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