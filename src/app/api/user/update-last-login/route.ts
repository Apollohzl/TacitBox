import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

let connection;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { social_uid, social_type } = body;

    if (!social_uid || !social_type) {
      return NextResponse.json({ success: false, error: '缺少必要参数 social_uid 或 social_type' }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 更新用户的最后登录时间
    const [result] = await connection.execute(
      `UPDATE users 
       SET last_login_at = CURRENT_TIMESTAMP 
       WHERE social_uid = ? AND social_type = ?`,
      [social_uid, social_type]
    ) as [any, any];

    if (result.affectedRows > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '最后登录时间更新成功',
        last_login_at: new Date().toLocaleString('zh-CN') 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '未找到对应用户，无法更新登录时间' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('更新最后登录时间时发生错误:', error);
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