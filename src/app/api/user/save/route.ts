import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip } = body;

    // 检查用户是否已存在
    const connection = await pool.getConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE social_uid = ? AND social_type = ?',
      [social_uid, social_type]
    ) as [any[], any];

    if (existingUsers.length > 0) {
      // 更新现有用户信息
      await connection.execute(
        `UPDATE users 
         SET nickname = ?, avatar_url = ?, gender = ?, location = ?, access_token = ?, 
             ip_address = ?, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE social_uid = ? AND social_type = ?`,
        [nickname, avatar_url, gender, location, access_token, ip, social_uid, social_type]
      );
    } else {
      // 创建新用户
      await connection.execute(
        `INSERT INTO users 
         (social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip_address, last_login_at,published_activities,participated_activities) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP,"[]","[]")`,
        [social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip]
      );
    }
    
    connection.release();

    return NextResponse.json({ success: true, message: '用户信息保存成功' });
  } catch (error) {
    console.error('保存用户信息时发生错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}