import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      activity_id, 
      participant_user_id, 
      participant_unique_id, 
      answers, 
      correct_count, 
      has_rewarded 
    } = body;

    if (!activity_id || !participant_unique_id || !answers) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    // 检查活动是否存在
    const [activities] = await connection.execute(
      'SELECT id FROM quiz_activities WHERE id = ?',
      [activity_id]
    ) as [any[], any];
    
    if (activities.length === 0) {
      connection.release();
      return NextResponse.json({ 
        success: false, 
        error: '测试活动不存在' 
      }, { status: 404 });
    }

    // 保存参与记录
    await connection.execute(
      `INSERT INTO quiz_participations 
       (activity_id, participant_user_id, participant_unique_id, answers, correct_count, has_rewarded) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        activity_id, 
        participant_user_id || null,  // 可为空，允许未登录用户参与
        participant_unique_id, 
        JSON.stringify(answers), 
        correct_count || 0, 
        has_rewarded || 0
      ]
    );
    
    connection.release();

    return NextResponse.json({ 
      success: true,
      message: '参与记录保存成功'
    });
  } catch (error) {
    console.error('保存参与记录时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}