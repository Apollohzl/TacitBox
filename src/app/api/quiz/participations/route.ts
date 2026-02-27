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

    if (!activityId) {
      return NextResponse.json({ success: false, error: '缺少必要参数 activityId' }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    const [participations] = await connection.execute(
      `SELECT activity_id, participant_user_id, answers, correct_count, has_rewarded, is_reward_delivered, participation_time
       FROM quiz_participations 
       WHERE activity_id = ?`,
      [activityId]
    ) as [any[], any];

    return NextResponse.json({
      success: true,
      data: {
        participations: participations
      }
    });
  } catch (error) {
    console.error('获取参与数据时发生错误:', error);
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