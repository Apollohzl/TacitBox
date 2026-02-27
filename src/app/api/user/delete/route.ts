import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json();
    const { social_uid, social_type } = body;

    if (!social_uid || !social_type) {
      return NextResponse.json({ success: false, error: '缺少必要参数 social_uid 或 social_type' }, { status: 400 });
    }

    connection = await pool.getConnection();
    
    // 删除用户数据
    const [result] = await connection.execute(
      `DELETE FROM users WHERE social_uid = ? AND social_type = ?`,
      [social_uid, social_type]
    ) as [any, any];

    if (result.affectedRows > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '账户删除成功' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '未找到对应用户，无法删除' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('删除用户数据时发生错误:', error);
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