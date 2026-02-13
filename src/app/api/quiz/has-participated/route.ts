import { NextRequest } from 'next/server';
import db from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const k = searchParams.get('k');
    const userId = searchParams.get('userId');

    if (!k || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing k or userId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 对k值进行URL编码，以确保与数据库中的值匹配
    const encodedK = k;

    // 获取用户参与的活动列表
    const [rows]: any = await db.execute(
      'SELECT participated_activities FROM users WHERE social_uid = ?',
      [userId]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found', hasParticipated: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = rows[0];
    const participatedActivities = user.participated_activities ? JSON.parse(user.participated_activities) : [];

    // 检查编码后的k值是否在参与列表中
    const hasParticipated = participatedActivities.includes(encodedK);
	
   	 return new Response(
   	   JSON.stringify({ success: true, hasParticipated: hasParticipated }),
   	   { status: 200, headers: { 'Content-Type': 'application/json' } }
  	  );
  } catch (error) {
    console.error('Error checking participation:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}