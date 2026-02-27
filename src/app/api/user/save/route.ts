import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip_address } = await request.json();

    if (!social_uid || !social_type) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    connection = await pool.getConnection();

    // 检查用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE social_uid = ? AND social_type = ?',
      [social_uid, social_type]
    ) as [any[], any];

    if (existingUsers.length > 0) {
      // 更新现有用户信息
      await connection.execute(
        `UPDATE users 
         SET nickname = ?, avatar_url = ?, gender = ?, location = ?, access_token = ?, ip_address = ?, updated_at = NOW()
         WHERE social_uid = ? AND social_type = ?`,
        [nickname, avatar_url, gender, location, access_token, ip_address, social_uid, social_type]
      );
    } else {
      // 插入新用户
      await connection.execute(
        `INSERT INTO users (social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip_address]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存用户信息时发生错误:', error);
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