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

    // 获取用户参与的活动列表
    const [rows]: any = await db.execute(
      'SELECT participated_activities FROM users WHERE social_uid = ?',
      [userId]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found', hasParticipated: false }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = rows[0];
    let participatedActivities = [];
    if (user.participated_activities) {
      try {
        participatedActivities = user.participated_activities;
        // 确保解析结果是数组
        //if (!Array.isArray(participatedActivities)) {
          //participatedActivities = [];
        //}
      } catch (parseError) {
        console.error('解析participated_activities失败:', parseError);
        participatedActivities = [];
      }
    }

    // 检查k值（原始和编码后）是否在参与列表中
    const hasParticipated = participatedActivities.includes(k) || 
                            participatedActivities.includes(encodeURIComponent(k));
	
   	 return new Response(
   	   JSON.stringify({ success: true, hasParticipated: hasParticipated ,user:user,participatedActivities:participatedActivities, type: typeof user  }),
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