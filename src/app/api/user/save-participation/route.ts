import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { social_uid, participation_data } = body;

    if (!social_uid || !participation_data) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    // 获取当前用户的参与活动数据
    const [users] = await connection.execute(
      'SELECT participated_activities FROM users WHERE social_uid = ?',
      [social_uid]
    ) as [any[], any];
    
    if (users.length === 0) {
      connection.release();
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 });
    }

    // 解析现有的参与活动数据
    let participatedActivities = users[0].participated_activities;
    if (participatedActivities) {
      try {
        participatedActivities = JSON.parse(participatedActivities);
      } catch (e) {
        console.warn('解析参与活动数据失败:', e);
        participatedActivities = [];
      }
    } else {
      participatedActivities = [];
    }

    // 添加新的参与数据
    participatedActivities.push(participation_data);

    // 更新用户数据
    await connection.execute(
      'UPDATE users SET participated_activities = ?, updated_at = CURRENT_TIMESTAMP WHERE social_uid = ?',
      [JSON.stringify(participatedActivities), social_uid]
    );
    
    connection.release();

    return NextResponse.json({ 
      success: true,
      message: '参与数据保存成功'
    });
  } catch (error) {
    console.error('保存用户参与数据时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 });
  }
}