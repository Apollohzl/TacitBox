import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少活动ID参数' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    // 查询指定活动的参与情况
    const [participations] = await connection.execute(
      'SELECT activity_id, user_id, answers, score, has_rewarded, created_at FROM quiz_participations WHERE activity_id = ?',
      [encodeURIComponent(activityId)]
    ) as [any[], any];
    
    connection.release();

    // 统计已获奖人数（has_rewarded为1的记录数量）
    const rewardedCount = participations.filter((p: any) => p.has_rewarded === 1 || p.has_rewarded === '1' || p.has_rewarded === true).length;

    return NextResponse.json({ 
      success: true,
      data: {
        totalParticipations: participations.length,
        rewardedCount: rewardedCount,
        participations: participations
      }
    });
  } catch (error) {
    console.error('获取参与数据时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}