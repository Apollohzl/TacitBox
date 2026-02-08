import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    
    if (!type || !code) {
      return NextResponse.json({ error: '缺少必要的参数' }, { status: 400 });
    }

    // Step 4: 通过Authorization Code获取用户信息
    const userResponse = await fetch(
      `https://u.daib.cn/connect.php?act=callback&appid=2423&appkey=5182677ea009b870808053105a2ded54&type=${type}&code=${code}`
    );

    const userData = await userResponse.json();

    if (userData.code !== 0) {
      return NextResponse.json({ error: userData.msg || '获取用户信息失败' }, { status: 400 });
    }

    // 将用户信息存储到数据库
    const { social_uid, access_token, faceimg, nickname, location, gender, ip } = userData;

    // 检查用户是否已存在
    const connection = await pool.getConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE social_uid = ? AND social_type = ?',
      [social_uid, type]
    ) as [any[], any];

    if (existingUsers.length > 0) {
      // 更新现有用户信息
      await connection.execute(
        `UPDATE users 
         SET nickname = ?, avatar_url = ?, gender = ?, location = ?, access_token = ?, 
             ip_address = ?, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE social_uid = ? AND social_type = ?`,
        [nickname, faceimg, gender, location, access_token, ip, social_uid, type]
      );
    } else {
      // 创建新用户
      await connection.execute(
        `INSERT INTO users 
         (social_uid, social_type, nickname, avatar_url, gender, location, access_token, ip_address, last_login_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [social_uid, type, nickname, faceimg, gender, location, access_token, ip]
      );
    }
    
    connection.release();

    // 重定向到成功页面，并传递用户信息
    const userInfo = {
      social_uid,
      social_type: type,
      nickname,
      avatar_url: faceimg,
      gender,
      location,
      access_token,
      ip_address: ip,
      last_login_at: new Date().toISOString()
    };

    const encodedUserInfo = encodeURIComponent(JSON.stringify(userInfo));
    return NextResponse.redirect(`${request.nextUrl.origin}/login/success?userInfo=${encodedUserInfo}`);
  } catch (error) {
    console.error('处理登录回调时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}