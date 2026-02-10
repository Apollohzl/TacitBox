import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// 指定此路由为动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const social_uid = searchParams.get('social_uid');
    const social_type = searchParams.get('social_type') || 'wx';

    if (!social_uid) {
      return NextResponse.json({ success: false, error: '缺少必要参数 social_uid' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      `SELECT id, social_uid, social_type, nickname, avatar_url, gender, location, 
              ip_address, created_at, last_login_at, updated_at 
       FROM users 
       WHERE social_uid = ? AND social_type = ?`,
      [social_uid, social_type]
    ) as [any[], any];
    
    connection.release();

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
    }

    const user = users[0];
    
    // 格式化时间为可读格式
    const formatDate = (date: Date | null) => {
      if (!date) return '未知';
      return new Date(date).toLocaleString('zh-CN');
    };

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        social_uid: user.social_uid,
        social_type: user.social_type,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        gender: user.gender,
        location: user.location,
        ip: user.ip_address,
        created_at: formatDate(user.created_at),
        last_login_at: formatDate(user.last_login_at)
      }
    });
  } catch (error) {
    console.error('获取用户详情时发生错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}